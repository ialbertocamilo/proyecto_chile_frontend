import React, { useState, useEffect, KeyboardEvent } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "../common/CustomButton";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import ModalCreate from "../common/ModalCreate";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import { Plus } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                    */
/* -------------------------------------------------------------------------- */

interface AngleAzimutOption {
  range_az: string;
  orientation: string;
}

interface DivisionAPI {
  a: number;
  b: number;
  d: number;
  division: string;
  division_id: number;
  num_orientation: number;
  orientation_id: number;
  is_deleted: boolean;
}

interface ObstructionsData {
  id: number;           // orientation_id
  division_id: number | null;
  index: number;
  división: string;
  floor_id: number;
  a: number;
  b: number;
  d: number;
  anguloAzimut: string;
  orientación: any;
  obstrucción: number;  // num_orientation
  mainRow: boolean;
}

interface EditingValues {
  roof_id: number;
  characteristic: string;
  area: number;
}

/* -------------------------------------------------------------------------- */
/*  Componente                                                                */
/* -------------------------------------------------------------------------- */

const ObstructionTable: React.FC = () => {
  /* ---------- Estados ----------------------------------------------------- */
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [tableData, setTableData] = useState<ObstructionsData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  // Modal Obstrucciones
  const [showModal, setShowModal] = useState(false);
  const [angleOptions, setAngleOptions] = useState<AngleAzimutOption[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<string>("");

  // División inline
  const [editingDivisionRowId, setEditingDivisionRowId] = useState<number | null>(null);
  const [editingDivisionValues, setEditingDivisionValues] = useState({
    division: "",
    a: 0,
    b: 0,
    d: 0,
  });

  // Modal Crear División
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("División 1");
  const [aValue, setAValue] = useState<string>("");
  const [bValue, setBValue] = useState<string>("");
  const [dValue, setDValue] = useState<string>("");
  const [currentOrientation, setCurrentOrientation] = useState<ObstructionsData | null>(null);

  // Confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ObstructionsData | null>(null);

  // Confirmación de eliminación de división
  const [showConfirmDivisionModal, setShowConfirmDivisionModal] = useState(false);
  const [rowToDeleteDivision, setRowToDeleteDivision] = useState<ObstructionsData | null>(null);

  // Otros estados heredados
  const [editingValues, setEditingValues] = useState<EditingValues>({
    roof_id: 0,
    characteristic: "",
    area: 0,
  });

  const token = localStorage.getItem("token") || "";

  /* ------------------------------------------------------------------------ */
  /*  Carga inicial: GET /obstruction/{enclosure_id}                          */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    const enclosureId = localStorage.getItem("recinto_id");
    if (!enclosureId) {
      notify("No se encontró el recinto_id en el LocalStorage", "error");
      return;
    }
    setTableLoading(true);

    fetch(`${constantUrlApiEndpoint}/obstruction/${enclosureId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const rows: ObstructionsData[] = [];

        data.orientations.forEach((o: any) => {
          /* Fila principal: solo orientación */
          rows.push({
            id: o.orientation_id,
            division_id: null,
            index: rows.length + 1,
            división: "-",
            floor_id: o.enclosure_id,
            a: 0,
            b: 0,
            d: 0,
            anguloAzimut: o.azimut,
            orientación: o.orientation,
            obstrucción: 0,
            mainRow: true,
          });

          /* Fila por cada división */
          o.divisions
            ?.sort((a: DivisionAPI, b: DivisionAPI) => a.num_orientation - b.num_orientation)
            .forEach((div: DivisionAPI) => {
              rows.push({
                id: o.orientation_id,
                division_id: div.division_id,
                index: rows.length + 1,
                división: div.division,
                floor_id: o.enclosure_id,
                a: div.a,
                b: div.b,
                d: div.d,
                anguloAzimut: o.azimut,
                orientación: o.orientation,
                obstrucción: div.num_orientation,
                mainRow: false,
              });
            });
        });

        setTableData(rows);
        setTableLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching table data:", error);
        notify("Error al cargar datos de obstrucciones", "error");
        setTableLoading(false);
      });
  }, [token]);

  /* ------------------------------------------------------------------------ */
  /*  Cargar opciones ángulo azimut cuando se abre modal                      */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!showModal) return;

    setSelectedAngle("");
    fetch(`${constantUrlApiEndpoint}/angle-azimut-and-orientation`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((data: AngleAzimutOption[]) => setAngleOptions(data))
      .catch((err) => {
        console.error("Error fetching angle azimut options:", err);
        notify("Error al cargar las opciones de ángulo azimut", "error");
      });
  }, [showModal, token]);

  /* ------------------------------------------------------------------------ */
  /*  Utilidades                                                              */
  /* ------------------------------------------------------------------------ */
  const preventMinus = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-") e.preventDefault();
  };

  const formatAngleOption = (o: AngleAzimutOption) => `${o.range_az} (${o.orientation})`;

  /* ------------------------------------------------------------------------ */
  /*  CRUD Orientación                                                        */
  /* ------------------------------------------------------------------------ */
  const handleEdit = (row: ObstructionsData) => {
    const newAngle = window.prompt("Seleccione el nuevo ángulo azimut:", row.anguloAzimut);
    if (!newAngle) return;

    fetch(`${constantUrlApiEndpoint}/orientation-update/${row.id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ azimut: newAngle }),
    })
      .then((r) => r.json())
      .then((data) => {
        const updated = { ...row, anguloAzimut: data.azimut, orientación: data.orientation };
        setTableData((prev) => prev.map((r) => (r.id === row.id && r.mainRow ? updated : r)));
        notify("Orientación actualizada correctamente", "success");
      })
      .catch((e) => {
        console.error("Error updating orientation:", e);
        notify("Error al actualizar orientación", "error");
      });
  };

  const handleDelete = (row: ObstructionsData) => {
    setRowToDelete(row);
    setShowConfirmModal(true);
  };

  const confirmDeletion = () => {
    if (!rowToDelete) return;

    fetch(`${constantUrlApiEndpoint}/obstruction/${rowToDelete.id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setTableData((prev) => prev.filter((r) => r.id !== rowToDelete.id));
        notify("Obstrucción eliminada exitosamente", "success");
        setShowConfirmModal(false);
        setRowToDelete(null);
      })
      .catch((e) => {
        console.error("Error deleting orientation:", e);
        notify("Error al eliminar obstrucción", "error");
        setShowConfirmModal(false);
        setRowToDelete(null);
      });
  };

  const handleCreateObstruction = () => {
    if (!selectedAngle) {
      notify("Debe seleccionar un ángulo azimut", "error");
      return;
    }
    const enclosureId = localStorage.getItem("recinto_id");
    if (!enclosureId) {
      notify("No se encontró el recinto_id en el LocalStorage", "error");
      return;
    }

    fetch(`${constantUrlApiEndpoint}/orientation-create/${enclosureId}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ azimut: selectedAngle }),
    })
      .then((r) => r.json())
      .then((data) => {
        const newRow: ObstructionsData = {
          id: data.id,
          division_id: null,
          index: tableData.length + 1,
          división: "-",
          floor_id: 0,
          a: 0,
          b: 0,
          d: 0,
          anguloAzimut: selectedAngle,
          orientación: data.orientation,
          obstrucción: 0,
          mainRow: true,
        };
        setTableData([...tableData, newRow]);
        setShowModal(false);
        notify("Obstrucción creada correctamente", "success");
      })
      .catch((e) => {
        console.error("Error al crear orientación:", e);
        notify("Error al crear orientación", "error");
      });
  };

  /* ------------------------------------------------------------------------ */
  /*  CRUD División                                                           */
  /* ------------------------------------------------------------------------ */
  const handleAcceptDivisionEdit = (row: ObstructionsData) => {
    if (!row.division_id) {
      notify("No se encontró el id de división para actualizar", "error");
      return;
    }
    const payload = {
      division: editingDivisionValues.division,
      a: editingDivisionValues.a,
      b: editingDivisionValues.b,
      d: editingDivisionValues.d,
    };

    fetch(`${constantUrlApiEndpoint}/division-update/${row.division_id}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        const updated: ObstructionsData = {
          ...row,
          división: data.division,
          a: data.a,
          b: data.b,
          d: data.d,
          division_id: data.id,
        };
        setTableData((prev) =>
          prev.map((r) => (r.division_id === row.division_id ? updated : r))
        );
        notify("División actualizada correctamente", "success");
        setEditingDivisionRowId(null);
      })
      .catch((e) => {
        console.error("Error updating division:", e);
        notify("Error al actualizar división", "error");
      });
  };

  const confirmDivisionDeletion = () => {
    if (!rowToDeleteDivision || !rowToDeleteDivision.division_id) {
      notify("No se encontró el id de división para eliminar", "error");
      setShowConfirmDivisionModal(false);
      setRowToDeleteDivision(null);
      return;
    }

    fetch(`${constantUrlApiEndpoint}/division-delete/${rowToDeleteDivision.division_id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setTableData((prev) =>
          prev.filter((r) => r.division_id !== rowToDeleteDivision.division_id)
        );
        notify("División eliminada exitosamente", "success");
        setShowConfirmDivisionModal(false);
        setRowToDeleteDivision(null);
      })
      .catch((e) => {
        console.error("Error deleting division:", e);
        notify("Error al eliminar división", "error");
        setShowConfirmDivisionModal(false);
        setRowToDeleteDivision(null);
      });
  };

  const handleCreateDivision = () => {
    if (
      aValue === "" ||
      bValue === "" ||
      dValue === "" ||
      Number(aValue) < 0 ||
      Number(bValue) < 0 ||
      Number(dValue) < 0
    ) {
      notify("Los valores de A, B y D deben ser números no negativos", "error");
      return;
    }

    if (!currentOrientation) {
      notify("No se ha seleccionado una orientación para agregar la división", "error");
      return;
    }

    const payload = {
      division: selectedDivision,
      a: Number(aValue),
      b: Number(bValue),
      d: Number(dValue),
    };

    fetch(`${constantUrlApiEndpoint}/division-create/${currentOrientation.id}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        const num = data.num_orientation; // ← número oficial del backend

        /* Si ya había una fila "-" para esa orientación, la usamos */
        const emptyRowIdx = tableData.findIndex(
          (row) => row.id === currentOrientation.id && row.división === "-"
        );

        if (emptyRowIdx !== -1) {
          const updatedRow: ObstructionsData = {
            ...tableData[emptyRowIdx],
            division_id: data.id,
            división: data.division,
            a: data.a,
            b: data.b,
            d: data.d,
            obstrucción: num,
          };
          setTableData((prev) =>
            prev.map((row, idx) => (idx === emptyRowIdx ? updatedRow : row))
          );
        } else {
          /* Insertamos una fila nueva justo después de las divisiones existentes */
          const newRow: ObstructionsData = {
            ...currentOrientation,
            division_id: data.id,
            división: data.division,
            a: data.a,
            b: data.b,
            d: data.d,
            obstrucción: num,
            index: tableData.length + 1,
            mainRow: false,
          };

          const mainIdx = tableData.findIndex(
            (r) => r.id === currentOrientation.id && r.mainRow
          );

          let insertIdx = mainIdx + 1;
          for (let i = mainIdx + 1; i < tableData.length; i++) {
            if (tableData[i].id === currentOrientation.id && !tableData[i].mainRow) {
              insertIdx = i + 1;
            } else break;
          }
          const newData = [...tableData];
          newData.splice(insertIdx, 0, newRow);
          setTableData(newData);
        }

        /* limpio modal */
        setSelectedDivision("División 1");
        setAValue("");
        setBValue("");
        setDValue("");
        setShowDivisionModal(false);
        notify("División creada correctamente", "success");
      })
      .catch((e) => {
        console.error("Error al crear División:", e);
        notify("Error al crear División", "error");
      });
  };

  /* ------------------------------------------------------------------------ */
  /*  Columnas de la tabla                                                    */
  /* ------------------------------------------------------------------------ */
  const columns = [
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: ObstructionsData) => {
        if (!row.mainRow) return "";
        if (editingRowId === row.id) {
          return (
            <select
              className="form-control"
              value={selectedAngle}
              onChange={(e) => setSelectedAngle(e.target.value)}
            >
              {angleOptions
                .filter(
                  (o) =>
                    !tableData.some(
                      (r) => r.anguloAzimut === o.range_az && r.id !== row.id
                    )
                )
                .map((o, i) => (
                  <option key={i} value={o.range_az}>
                    {formatAngleOption(o)}
                  </option>
                ))}
            </select>
          );
        }
        return row.anguloAzimut;
      },
    },
    {
      headerName: "Orientación",
      field: "orientación",
      renderCell: (row: ObstructionsData) => (row.mainRow ? row.orientación ?? "-" : ""),
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: ObstructionsData) => {
        if (!row.mainRow) return "";
        if (editingRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleEdit(row)}
              onCancel={() => setEditingRowId(null)}
            />
          );
        }
        return (
          <ActionButtons
            onEdit={() => {
              setEditingRowId(row.id);
              setSelectedAngle(row.anguloAzimut);
            }}
            onDelete={() => handleDelete(row)}
          />
        );
      },
    },
    {
      headerName: "Obstrucción",
      field: "obstrucción",
      renderCell: (row: ObstructionsData) => (row.obstrucción === 0 ? "-" : row.obstrucción),
    },
    {
      headerName: "División",
      field: "división",
      renderCell: (row: ObstructionsData) => {
        if (editingDivisionRowId === row.id) {
          return (
            <select
              className="form-control"
              value={editingDivisionValues.division}
              onChange={(e) =>
                setEditingDivisionValues({ ...editingDivisionValues, division: e.target.value })
              }
            >
              {["División 1", "División 2", "División 3", "División 4", "División 5"].map(
                (div, i) => (
                  <option key={i} value={div}>
                    {div}
                  </option>
                )
              )}
            </select>
          );
        }
        return row.división;
      },
    },
    {
      headerName: "A [m]",
      field: "a",
      renderCell: (row: ObstructionsData) => {
        if (editingDivisionRowId === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              min={0}
              value={editingDivisionValues.a}
              onChange={(e) =>
                setEditingDivisionValues({ ...editingDivisionValues, a: Number(e.target.value) })
              }
              onKeyDown={preventMinus}
            />
          );
        }
        return row.a === 0 ? "-" : row.a;
      },
    },
    {
      headerName: "B [m]",
      field: "b",
      renderCell: (row: ObstructionsData) => {
        if (editingDivisionRowId === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              min={0}
              value={editingDivisionValues.b}
              onChange={(e) =>
                setEditingDivisionValues({ ...editingDivisionValues, b: Number(e.target.value) })
              }
              onKeyDown={preventMinus}
            />
          );
        }
        return row.b === 0 ? "-" : row.b;
      },
    },
    {
      headerName: "D [m]",
      field: "d",
      renderCell: (row: ObstructionsData) => {
        if (editingDivisionRowId === row.id) {
          return (
            <input
              type="number"
              className="form-control"
              min={0}
              value={editingDivisionValues.d}
              onChange={(e) =>
                setEditingDivisionValues({ ...editingDivisionValues, d: Number(e.target.value) })
              }
              onKeyDown={preventMinus}
            />
          );
        }
        return row.d === 0 ? "-" : row.d;
      },
    },
    {
      headerName: "Acciones",
      field: "accionesDivision",
      renderCell: (row: ObstructionsData) => {
        if (editingDivisionRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleAcceptDivisionEdit(row)}
              onCancel={() => setEditingDivisionRowId(null)}
            />
          );
        }
        return (
          <>
            {row.división !== "-" && (
              <>
                <CustomButton
                  variant="editIcon"
                  onClick={() => {
                    setEditingDivisionRowId(row.id);
                    setEditingDivisionValues({
                      division: row.división,
                      a: row.a,
                      b: row.b,
                      d: row.d,
                    });
                  }}
                >
                  <i className="fa fa-edit" />
                </CustomButton>
                <CustomButton
                  variant="deleteIcon"
                  onClick={() => {
                    setRowToDeleteDivision(row);
                    setShowConfirmDivisionModal(true);
                  }}
                  style={{ marginLeft: "-15px" }}
                >
                  <i className="fa fa-trash" />
                </CustomButton>
              </>
            )}
            <CustomButton
              onClick={() => {
                setCurrentOrientation(row);
                setShowDivisionModal(true);
              }}
              style={{ marginLeft: "2px" }}
            >
              <i className="fa fa-plus" />
            </CustomButton>
          </>
        );
      },
    },
  ];

  /* ------------------------------------------------------------------------ */
  /*  Render                                                                  */
  /* ------------------------------------------------------------------------ */
  return (
    <div>
      <div style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-end gap-2 w-100">
          <CustomButton variant="save" onClick={() => setShowModal(true)}>
            <Plus className="me-1" size={16} />
            Nuevas Obstrucciones
          </CustomButton>
        </div>
      </div>

      {tableLoading ? (
        <div className="text-center p-4">
          <p>Cargando datos de obstrucciones...</p>
        </div>
      ) : (
        <TablesParameters columns={columns} data={tableData} />
      )}

      {/* ---------------------------- Modal Obstrucción --------------------- */}
      <ModalCreate
        isOpen={showModal}
        saveLabel="Crear Obstrucción"
        onClose={() => setShowModal(false)}
        onSave={handleCreateObstruction}
        title="Crear Obstrucción"
      >
        <div className="form-group">
          <label htmlFor="angleAzimutSelect">Ángulo Azimut</label>
          <select
            id="angleAzimutSelect"
            className="form-control"
            value={selectedAngle}
            onChange={(e) => setSelectedAngle(e.target.value)}
          >
            <option value="" disabled>
              Seleccione una opción
            </option>
            {angleOptions
              .filter(
                (o) => !tableData.some((r) => r.anguloAzimut === o.range_az)
              )
              .map((o, i) => (
                <option key={i} value={o.range_az}>
                  {formatAngleOption(o)}
                </option>
              ))}
          </select>
        </div>
      </ModalCreate>

      {/* ----------------------------- Modal División ----------------------- */}
      <ModalCreate
        isOpen={showDivisionModal}
        saveLabel="Crear División"
        onClose={() => {
          setShowDivisionModal(false);
          setCurrentOrientation(null);
        }}
        onSave={handleCreateDivision}
        title="Crear División"
      >
        <div className="form-group">
          <label htmlFor="divisionSelect">División</label>
          <select
            id="divisionSelect"
            className="form-control"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            {["División 1", "División 2", "División 3", "División 4", "División 5"].map(
              (div, i) => (
                <option key={i} value={div}>
                  {div}
                </option>
              )
            )}
          </select>
        </div>
        <div className="form-group mt-2">
          <label htmlFor="aInput">A [m]</label>
          <input
            id="aInput"
            type="number"
            className="form-control"
            min={0}
            value={aValue}
            onChange={(e) => setAValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
        <div className="form-group mt-2">
          <label htmlFor="bInput">B [m]</label>
          <input
            id="bInput"
            type="number"
            className="form-control"
            min={0}
            value={bValue}
            onChange={(e) => setBValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
        <div className="form-group mt-2">
          <label htmlFor="dInput">D [m]</label>
          <input
            id="dInput"
            type="number"
            className="form-control"
            min={0}
            value={dValue}
            onChange={(e) => setDValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
      </ModalCreate>

      {/* ---------------------- Confirmar eliminación orientación ----------- */}
      <ModalCreate
        isOpen={showConfirmModal}
        saveLabel="Confirmar"
        onClose={() => {
          setShowConfirmModal(false);
          setRowToDelete(null);
        }}
        onSave={confirmDeletion}
        title="Confirmación de Eliminación"
      >
        <p>¿Estás seguro de eliminar esta obstrucción?</p>
      </ModalCreate>

      {/* ---------------------- Confirmar eliminación división ------------- */}
      <ModalCreate
        isOpen={showConfirmDivisionModal}
        saveLabel="Confirmar"
        onClose={() => {
          setShowConfirmDivisionModal(false);
          setRowToDeleteDivision(null);
        }}
        onSave={confirmDivisionDeletion}
        title="Confirmación de Eliminación"
      >
        <p>¿Estás seguro de eliminar esta división?</p>
      </ModalCreate>
    </div>
  );
};

export default ObstructionTable;
