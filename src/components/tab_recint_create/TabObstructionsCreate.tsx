import React, { useState, useEffect, KeyboardEvent } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "../common/CustomButton";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import ModalCreate from "../common/ModalCreate";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

interface ObstructionsData {
  id: number; // id de la orientación
  division_id: number | null; // id de la división (nuevo)
  index: number;
  división: string;
  floor_id: number;
  b: number;
  a: number;
  d: number;
  anguloAzimut: string;
  orientación: any;
  obstrucción: number;
}

interface EditingValues {
  roof_id: number;
  characteristic: string;
  area: number;
}

const ObstructionTable: React.FC = () => {
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [tableData, setTableData] = useState<ObstructionsData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  // Modal para crear Obstrucciones (ya existente)
  const [showModal, setShowModal] = useState(false);
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  // selectedAngle se usará tanto en el modal de creación como en la edición inline
  const [selectedAngle, setSelectedAngle] = useState<string>("");
  // Estado para controlar la visibilidad del botón "+"
  const [showPlus, setShowPlus] = useState<boolean>(true);
  const [editingValues, setEditingValues] = useState<EditingValues>({
    roof_id: 0,
    characteristic: "",
    area: 0
  });

  // Estado para edición inline de división
  const [editingDivisionRowId, setEditingDivisionRowId] = useState<number | null>(null);
  const [editingDivisionValues, setEditingDivisionValues] = useState({
    division: "",
    a: 0,
    b: 0,
    d: 0,
  });

  // Nuevo estado para el modal de creación de División
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("División 1");
  const [aValue, setAValue] = useState<string>("");
  const [bValue, setBValue] = useState<string>("");
  const [dValue, setDValue] = useState<string>("");

  // Nuevos estados para el modal de confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ObstructionsData | null>(null);

  const token = localStorage.getItem("token") || "";

  // Cargar datos existentes desde el servidor al montar el componente
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
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Mapea los datos recibidos a la estructura que usa la tabla
        const mappedData = data.orientations.map((orientation: any, index: number) => {
          // Si existe al menos una división, se toma la primera
          const divisionData =
            orientation.divisions && orientation.divisions.length > 0
              ? orientation.divisions[0]
              : null;

          return {
            id: orientation.orientation_id, // id de la orientación
            division_id: divisionData ? divisionData.division_id : null, // id de la división
            index: index + 1,
            división: divisionData ? divisionData.division : "-",
            floor_id: orientation.enclosure_id, // O el valor que corresponda
            a: divisionData ? divisionData.a : 0,
            b: divisionData ? divisionData.b : 0,
            d: divisionData ? divisionData.d : 0,
            anguloAzimut: orientation.azimut,
            orientación: orientation.orientation,
            obstrucción: 0, // Puedes ajustar este valor según corresponda
          };
        });
        setTableData(mappedData);
        setTableLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching table data:", error);
        notify("Error al cargar datos de obstrucciones", "error");
        setTableLoading(false);
      });
  }, [token]);

  // Se carga la información del endpoint cuando se abre el modal de Obstrucciones
  useEffect(() => {
    if (showModal) {
      fetch(`${constantUrlApiEndpoint}/angle-azimut`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
        .then((response) => response.json())
        .then((data: string[]) => {
          setAngleOptions(data);
        })
        .catch((error) => {
          console.error("Error fetching angle azimut options:", error);
          notify("Error al cargar las opciones de ángulo azimut", "error");
        });
    }
  }, [showModal, token]);

  // Función para editar la orientación (ya existente)
  const handleEdit = (row: ObstructionsData) => {
    const newAngle = window.prompt("Seleccione el nuevo ángulo azimut:", row.anguloAzimut);
    if (!newAngle) return;

    fetch(`${constantUrlApiEndpoint}/orientation-update/${row.id}`, {
      method: "PUT",
      headers: {
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ azimut: newAngle })
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedRow = { ...row, anguloAzimut: data.azimut, orientación: data.orientation };
        setTableData(prevData =>
          prevData.map(r => (r.id === row.id ? updatedRow : r))
        );
        notify("Orientación actualizada correctamente", "success");
      })
      .catch((error) => {
        console.error("Error updating orientation:", error);
        notify("Error al actualizar orientación", "error");
      });
  };

  // Función para eliminar la obstrucción utilizando modal de confirmación
  const handleDelete = (row: ObstructionsData) => {
    setRowToDelete(row);
    setShowConfirmModal(true);
  };

  // Función para confirmar la eliminación de la obstrucción
  const confirmDeletion = () => {
    if (!rowToDelete) return;

    fetch(`${constantUrlApiEndpoint}/obstruction/${rowToDelete.id}`, {
      method: "DELETE",
      headers: {
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => response.json())
      .then(() => {
        setTableData(prevData => prevData.filter(r => r.id !== rowToDelete.id));
        notify("Obstrucción eliminada exitosamente", "success");
        setShowConfirmModal(false);
        setRowToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting orientation:", error);
        notify("Error al eliminar obstrucción", "error");
        setShowConfirmModal(false);
        setRowToDelete(null);
      });
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditingValues({
      roof_id: 0,
      characteristic: "",
      area: 0
    });
  };

  // Función para aceptar la edición inline del ángulo azimut 
  const handleAcceptEdit = (row: ObstructionsData) => {
    fetch(`${constantUrlApiEndpoint}/orientation-update/${row.id}`, {
      method: "PUT",
      headers: {
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ azimut: selectedAngle })
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedRow = { ...row, anguloAzimut: data.azimut, orientación: data.orientation };
        setTableData(prevData =>
          prevData.map(r => (r.id === row.id ? updatedRow : r))
        );
        notify("Orientación actualizada correctamente", "success");
        setEditingRowId(null);
      })
      .catch((error) => {
        console.error("Error updating orientation:", error);
        notify("Error al actualizar orientación", "error");
      });
  };

  // Funciones para editar la división inline
  const handleCancelDivisionEdit = () => {
    setEditingDivisionRowId(null);
  };

  // Función para aceptar la edición inline de la división usando el endpoint PUT /division-update/{division_id}
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
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        const updatedRow: ObstructionsData = {
          ...row,
          división: data.division,
          a: data.a,
          b: data.b,
          d: data.d,
          division_id: data.id,
        };
        setTableData(prevData =>
          prevData.map(r => (r.id === row.id ? updatedRow : r))
        );
        notify("División actualizada correctamente", "success");
        setEditingDivisionRowId(null);
      })
      .catch((error) => {
        console.error("Error updating division:", error);
        notify("Error al actualizar división", "error");
      });
  };

  // Función para prevenir la entrada del guion "-" en los inputs numéricos
  const preventMinus = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-") {
      e.preventDefault();
    }
  };

  // Manejador del cambio en el select para ángulo azimut (usado en el modal de creación)
  const handleAngleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAngle(event.target.value);
  };

  // Función para cerrar el modal de Obstrucciones
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Función para crear la orientación (ya existente)
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
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ azimut: selectedAngle })
    })
      .then(response => response.json())
      .then(data => {
        const newObstruction: ObstructionsData = {
          id: data.id,
          division_id: null,
          index: tableData.length + 1,
          división: "-",
          floor_id: 0,
          b: 0,
          a: 0,
          d: 0,
          anguloAzimut: selectedAngle,
          orientación: data.orientation,
          obstrucción: 0,
        };

        setTableData([...tableData, newObstruction]);
        setShowPlus(true);
        setShowModal(false);
        notify("Obstrucción creada correctamente", "success");
      })
      .catch((error) => {
        console.error("Error al crear orientación:", error);
        notify("Error al crear orientación", "error");
      });
  };

  // Función para crear la División actualizando la fila existente
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

    const payload = {
      division: selectedDivision,
      a: Number(aValue),
      b: Number(bValue),
      d: Number(dValue)
    };

    const indexToUpdate = tableData.findIndex(row => row.división === "-");
    if (indexToUpdate === -1) {
      notify("No se encontró una fila para actualizar la división", "error");
      return;
    }
    const currentOrientationId = tableData[indexToUpdate].id;

    fetch(`${constantUrlApiEndpoint}/division-create/${currentOrientationId}`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        const updatedRow: ObstructionsData = {
          ...tableData[indexToUpdate],
          división: data.division,
          a: data.a,
          b: data.b,
          d: data.d,
          division_id: data.id,
        };

        setTableData(prevData =>
          prevData.map((row, idx) => (idx === indexToUpdate ? updatedRow : row))
        );

        setSelectedDivision("División 1");
        setAValue("");
        setBValue("");
        setDValue("");
        setShowDivisionModal(false);
        notify("División creada correctamente", "success");
      })
      .catch((error) => {
        console.error("Error al crear División:", error);
        notify("Error al crear División", "error");
      });
  };

  // Definición de columnas para la tabla de obstrucciones
  const columns = [
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
                setEditingDivisionValues({
                  ...editingDivisionValues,
                  division: e.target.value,
                })
              }
            >
              {["División 1", "División 2", "División 3", "División 4", "División 5"].map((div, index) => (
                <option key={index} value={div}>
                  {div}
                </option>
              ))}
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
                setEditingDivisionValues({
                  ...editingDivisionValues,
                  a: Number(e.target.value),
                })
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
                setEditingDivisionValues({
                  ...editingDivisionValues,
                  b: Number(e.target.value),
                })
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
                setEditingDivisionValues({
                  ...editingDivisionValues,
                  d: Number(e.target.value),
                })
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
              onCancel={handleCancelDivisionEdit}
            />
          );
        }
        return (
          <>
            {row.división !== "-" && (
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
            )}
            <CustomButton
              onClick={() => setShowDivisionModal(true)}
              style={{ marginLeft: "5px" }}
            >
              <i className="fa fa-plus" />
            </CustomButton>

          </>
        );
      },
    },
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: ObstructionsData) => {
        if (editingRowId === row.id) {
          return (
            <select
              className="form-control"
              value={selectedAngle}
              onChange={(e) => setSelectedAngle(e.target.value)}
            >
              {angleOptions.map((angle, index) => (
                <option key={index} value={angle}>
                  {angle}
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
      renderCell: (row: ObstructionsData) => row.orientación ? row.orientación : "-",
    },
    {
      headerName: "Obstrucción",
      field: "obstrucción",
      renderCell: (row: ObstructionsData) => row.obstrucción === 0 ? "-" : row.obstrucción,
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: ObstructionsData) => {
        if (editingRowId === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleAcceptEdit(row)}
              onCancel={handleCancel}
            />
          );
        }
        return (
          <ActionButtons
            onDelete={() => handleDelete(row)}
            onEdit={() => {
              setEditingRowId(row.id);
              setSelectedAngle(row.anguloAzimut);
            }}
          />
        );
      },
    },
  ];

  return (
    <div>
      {tableLoading ? (
        <div className="text-center p-4">
          <p>Cargando datos de pisos...</p>
        </div>
      ) : (
        <TablesParameters columns={columns} data={tableData} />
      )}
      <div style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-end gap-2 w-100">
          <CustomButton variant="save" onClick={() => setShowModal(true)}>
            Crear Obstrucciones
          </CustomButton>
        </div>
      </div>

      {/* Modal existente para crear obstrucciones */}
      <ModalCreate
        isOpen={showModal}
        saveLabel="Grabar Datos"
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
            onChange={handleAngleChange}
          >
            <option value="" disabled>Seleccione una opción</option>
            {angleOptions.map((angle, index) => (
              <option key={index} value={angle}>
                {angle}
              </option>
            ))}
          </select>
        </div>
      </ModalCreate>

      {/* Modal para crear División */}
      <ModalCreate
        isOpen={showDivisionModal}
        saveLabel="Grabar Datos"
        onClose={() => setShowDivisionModal(false)}
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
            {["División 1", "División 2", "División 3", "División 4", "División 5"].map((div, index) => (
              <option key={index} value={div}>
                {div}
              </option>
            ))}
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

      {/* Modal de confirmación para eliminar obstrucción */}
      <ModalCreate
        isOpen={showConfirmModal}
        saveLabel="Confirmar"
        onClose={() => { setShowConfirmModal(false); setRowToDelete(null); }}
        onSave={confirmDeletion}
        title="Confirmación de Eliminación"
      >
        <p>¿Estás seguro de eliminar esta obstrucción?</p>
      </ModalCreate>
    </div>
  );
};

export default ObstructionTable;
