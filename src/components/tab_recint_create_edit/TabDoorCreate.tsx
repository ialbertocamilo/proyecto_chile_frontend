import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import ThermalBridgesDoorModal from "../modals/ThermalBridgesDoorModal";
import { Plus } from "lucide-react";

interface DoorData {
  id: number;
  door_id: number;
  tipoPuente: string;
  characteristics: string;
  anguloAzimut: string;
  orientacion: string;
  high: number;
  broad: number;
  fav1D: number;
  fav1L: number;
  fav2izqP: number;
  fav2izqS: number;
  fav2DerP: number;
  fav2DerS: number;
  fav3E: number;
  fav3T: number;
  fav3Beta: number;
  fav3Alpha: number;
  fav_id: number | null;
}

const TabDoorCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  // Estados para datos de creación
  const [doorId, setDoorId] = useState<number>(0);
  const [characteristics, setCharacteristics] = useState<string>("");
  const [anguloAzimut, setAnguloAzimut] = useState<string>("");
  const [high, setHigh] = useState<number>(0);
  const [broad, setBroad] = useState<number>(0);

  // Estado para la tabla
  const [data, setData] = useState<DoorData[]>([]);
  // Estados para edición de datos generales
  const [editingRow, setEditingRow] = useState<DoorData | null>(null);
  // Estados para edición independiente de FAV
  const [editingFavRow, setEditingFavRow] = useState<number | null>(null);
  const [favEditData, setFavEditData] = useState<any>(null);

  // Estados para modales de creación y eliminación
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<DoorData | null>(null);

  // Estado para opciones de ángulo y de puertas
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  const [doorOptions, setDoorOptions] = useState<any[]>([]);

  // Función para formatear el valor a mostrar en las celdas
  const displayValue = (value: any) => {
    return value === 0 || value === "N/A" ? "-" : value;
  };

  // Handler para evitar ingreso de guiones
  const preventHyphen = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-") {
      e.preventDefault();
    }
  };

  // Cargar datos y opciones al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener puertas de recinto
        const doorEnclosuresResponse = await fetch(
          `${constantUrlApiEndpoint}/door-enclosures/${enclosure_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!doorEnclosuresResponse.ok) {
          throw new Error("Error al obtener los datos de puertas");
        }
        const doorEnclosuresData = await doorEnclosuresResponse.json();

        // Mapear datos iniciales
        const tableData: DoorData[] = doorEnclosuresData.map((item: any) => ({
          id: item.id,
          door_id: item.door_id,
          tipoPuente: `ID: ${item.door_id}`, // Se actualizará si se encuentra en doorOptions
          characteristics: item.characteristics,
          anguloAzimut: item.angulo_azimut,
          orientacion: item.orientation,
          high: item.high,
          broad: item.broad,
          fav1D: 0,
          fav1L: 0,
          fav2izqP: 0,
          fav2izqS: 0,
          fav2DerP: 0,
          fav2DerS: 0,
          fav3E: 0,
          fav3T: 0,
          fav3Beta: 0,
          fav3Alpha: 0,
          fav_id: null,
        }));

        // Obtener FAVs de puerta y fusionar con la tabla
        const favResponse = await fetch(
          `${constantUrlApiEndpoint}/door/fav-enclosures/${enclosure_id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!favResponse.ok) {
          throw new Error("Error al obtener los favs de puerta");
        }
        const favsData = await favResponse.json();

        const mergedData = tableData.map((row) => {
          const fav = favsData.find((f: any) => f.item_id === row.id);
          if (fav) {
            return {
              ...row,
              fav1D: fav.fav1.d,
              fav1L: fav.fav1.l,
              fav2izqP: fav.fav2_izq.p,
              fav2izqS: fav.fav2_izq.s,
              fav2DerP: fav.fav2_der.p,
              fav2DerS: fav.fav2_der.s,
              fav3E: fav.fav3.e,
              fav3T: fav.fav3.t,
              fav3Beta: fav.fav3.beta,
              fav3Alpha: fav.fav3.alfa,
              fav_id: fav.id,
            };
          }
          return row;
        });

        // Obtener opciones de ángulo
        const angleResponse = await fetch(
          `${constantUrlApiEndpoint}/angle-azimut`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!angleResponse.ok) {
          throw new Error("Error al obtener las opciones de ángulo azimut");
        }
        const angleOpts: string[] = await angleResponse.json();
        setAngleOptions(angleOpts);

        // Obtener opciones de puerta
        const doorResponse = await fetch(
          `${constantUrlApiEndpoint}/user/elements/?type=door`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!doorResponse.ok) {
          throw new Error("Error al obtener las opciones de puertas");
        }
        const doorData = await doorResponse.json();
        setDoorOptions(doorData);

        // Actualizar el nombre de la puerta en la tabla si se encuentra en doorOptions
        const updatedData = mergedData.map((row) => {
          const doorInfo = doorData.find(
            (door: any) => door.id === row.door_id
          );
          if (doorInfo) {
            return { ...row, tipoPuente: doorInfo.name_element };
          }
          return row;
        });

        setData(updatedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        notify("Error al cargar los datos", "error");
      }
    };

    fetchData();
  }, [token, enclosure_id]);

  // Función para refrescar datos de la tabla
  const fetchDoorData = async () => {
    try {
      const doorEnclosuresResponse = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures/${enclosure_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!doorEnclosuresResponse.ok) {
        throw new Error("Error al obtener los datos de puertas");
      }
      const doorEnclosuresData = await doorEnclosuresResponse.json();
      const tableData: DoorData[] = doorEnclosuresData.map((item: any) => ({
        id: item.id,
        door_id: item.door_id,
        tipoPuente: `ID: ${item.door_id}`,
        characteristics: item.characteristics,
        anguloAzimut: item.angulo_azimut,
        orientacion: item.orientation,
        high: item.high,
        broad: item.broad,
        fav1D: 0,
        fav1L: 0,
        fav2izqP: 0,
        fav2izqS: 0,
        fav2DerP: 0,
        fav2DerS: 0,
        fav3E: 0,
        fav3T: 0,
        fav3Beta: 0,
        fav3Alpha: 0,
        fav_id: null,
      }));

      const favResponse = await fetch(
        `${constantUrlApiEndpoint}/door/fav-enclosures/${enclosure_id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!favResponse.ok) {
        throw new Error("Error al obtener los favs de puerta");
      }
      const favsData = await favResponse.json();

      const mergedData = tableData.map((row) => {
        const fav = favsData.find((f: any) => f.item_id === row.id);
        if (fav) {
          return {
            ...row,
            fav1D: fav.fav1.d,
            fav1L: fav.fav1.l,
            fav2izqP: fav.fav2_izq.p,
            fav2izqS: fav.fav2_izq.s,
            fav2DerP: fav.fav2_der.p,
            fav2DerS: fav.fav2_der.s,
            fav3E: fav.fav3.e,
            fav3T: fav.fav3.t,
            fav3Beta: fav.fav3.beta,
            fav3Alpha: fav.fav3.alfa,
            fav_id: fav.id,
          };
        }
        return row;
      });

      // Actualizar el nombre de la puerta usando doorOptions ya cargado
      const updatedData = mergedData.map((row) => {
        const doorInfo = doorOptions.find(
          (door: any) => door.id === row.door_id
        );
        if (doorInfo) {
          return { ...row, tipoPuente: doorInfo.name_element };
        }
        return row;
      });

      setData(updatedData);
    } catch (error) {
      console.error("Error fetching door data:", error);
      notify("Error al cargar los datos de puertas", "error");
    }
  };

  // Funciones para edición de la fila general
  const handleEdit = (row: DoorData) => {
    // Al iniciar la edición, se actualiza el valor de tipoPuente con el nombre correspondiente de doorOptions
    const doorInfo = doorOptions.find((door: any) => door.id === row.door_id);
    const tipoPuente = doorInfo ? doorInfo.name_element : row.tipoPuente;
    setEditingRow({ ...row, tipoPuente });
  };
  //ThermalBridgesModal OPEN
  const [showModalThermicBridges, setShowModalThermicBridges] =
    useState<boolean>(false);
  const handleCloseEditBridge = () => {
    setShowModalThermicBridges(false);
    setEditingFavRow(null);
    // setData([]);
  };
  function handleThermicBridgesDoor(row: any) {
    // console.log("Puentes térmicos para el bridgeId:", bridgeId);
    console.log("row", row);
    handleFavEditClick(row);

    console.log("favEditData", favEditData);
    // console.log("editingBridgeData", editingBridgeData);
    // console.log("detailOptions", detailOptions);
    setShowModalThermicBridges(true);
  }
  const handleRowFieldChange = (
    field: keyof DoorData,
    value: string | number
  ) => {
    if (editingRow) {
      setEditingRow({ ...editingRow, [field]: value });
    }
  };

  const handleAccept = async () => {
    if (!editingRow) return;
    try {
      const selectedDoor = doorOptions.find(
        (door: any) => door.name_element === editingRow.tipoPuente
      );
      const doorId = selectedDoor ? selectedDoor.id : 0;
      const payload = {
        door_id: doorId,
        characteristics: editingRow.characteristics,
        angulo_azimut: editingRow.anguloAzimut,
        high: editingRow.high,
        broad: editingRow.broad,
      };
      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-update/${editingRow.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar el registro");
      }
      notify("Cambios guardados correctamente");
      setEditingRow(null);
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al guardar los cambios", "error");
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  // Funciones para edición de FAV
  const handleFavEditClick = (row: DoorData) => {
    setEditingFavRow(row.id);
    setFavEditData({
      fav_id: row.fav_id,
      fav1D: row.fav1D,
      fav1L: row.fav1L,
      fav2izqP: row.fav2izqP,
      fav2izqS: row.fav2izqS,
      fav2DerP: row.fav2DerP,
      fav2DerS: row.fav2DerS,
      fav3E: row.fav3E,
      fav3T: row.fav3T,
      fav3Beta: row.fav3Beta,
      fav3Alpha: row.fav3Alpha,
    });
  };

  const handleFavEditChange = (field: string, value: any) => {
    setFavEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConfirmEditFav = async () => {
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/door/fav-enclosures-update/${favEditData.fav_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fav1: { d: favEditData.fav1D, l: favEditData.fav1L },
            fav2_izq: { p: favEditData.fav2izqP, s: favEditData.fav2izqS },
            fav2_der: { p: favEditData.fav2DerP, s: favEditData.fav2DerS },
            fav3: {
              e: favEditData.fav3E,
              t: favEditData.fav3T,
              beta: favEditData.fav3Beta,
              alfa: favEditData.fav3Alpha,
            },
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar los favs");
      }
      notify("FAV actualizado exitosamente");
      setEditingFavRow(null);
      setFavEditData(null);
      fetchDoorData();
    } catch (error) {
      console.error(error);
      notify("Error al actualizar los favs", "error");
    }
  };

  // Función para eliminar puerta
  const handleDeleteConfirm = async () => {
    if (!deletingRow) return;
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-delete/${deletingRow.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar la puerta");
      }
      notify("Puerta eliminada exitosamente");
      setShowDeleteModal(false);
      setDeletingRow(null);
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al eliminar la puerta", "error");
    }
  };

  // Funciones para manejo del modal de creación
  const handleCreate = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setDoorId(0);
    setCharacteristics("");
    setAnguloAzimut("");
    setHigh(0);
    setBroad(0);
  };

  // Endpoint para creación de puerta con validación de campos obligatorios
  const handleModalSave = async () => {
    // Validación: todos los campos deben tener un valor válido
    if (
      doorId === 0 ||
      characteristics === "" ||
      anguloAzimut === "" ||
      high <= 0 ||
      broad <= 0
    ) {
      notify("Todos los campos son obligatorios");
      return;
    }

    const payload = {
      door_id: doorId,
      characteristics: characteristics,
      angulo_azimut: anguloAzimut,
      high: high,
      broad: broad,
    };

    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/door-enclosures-create/${enclosure_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la creación");
      }

      notify("Puerta creada exitosamente");
      handleModalClose();
      // Refrescar la tabla después de crear
      fetchDoorData();
    } catch (error) {
      console.error("Error:", error);
      notify("Error al crear la puerta", "error");
    }
  };

  // Estilo para inputs FAV
  const favInputStyle = { height: "20px", fontSize: "14px", width: "120px" };

  // Definición de columnas y multiHeader para la tabla
  const columns = [
    {
      headerName: "Tipo Puente",
      field: "tipoPuente",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.tipoPuente}
              onChange={(e) =>
                handleRowFieldChange("tipoPuente", e.target.value)
              }
            >
              {doorOptions.map((door: any) => (
                <option key={door.id} value={door.name_element}>
                  {door.name_element}
                </option>
              ))}
            </select>
          );
        }
        return displayValue(row.tipoPuente);
      },
    },
    {
      headerName: "Características",
      field: "characteristics",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.characteristics}
              onChange={(e) =>
                handleRowFieldChange("characteristics", e.target.value)
              }
            >
              <option value="">Seleccione una opción</option>
              <option value="Exterior">Exterior</option>
              <option value="Inter Recintos Clim">Inter Recintos Clim</option>
              <option value="Inter Recintos No Clim">
                Inter Recintos No Clim
              </option>
            </select>
          );
        }
        return displayValue(row.characteristics);
      },
    },
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <select
              className="form-control"
              value={editingRow.anguloAzimut}
              onChange={(e) =>
                handleRowFieldChange("anguloAzimut", e.target.value)
              }
            >
              <option value="">Seleccione un ángulo</option>
              {angleOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return displayValue(row.anguloAzimut);
      },
    },
    {
      headerName: "Orientación",
      field: "orientacion",
      renderCell: (row: DoorData) => displayValue(row.orientacion),
    },
    {
      headerName: "Alto [m]",
      field: "high",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <input
              type="number"
              min={0}
              className="form-control"
              value={editingRow.high}
              onChange={(e) =>
                handleRowFieldChange("high", Number(e.target.value))
              }
              onKeyDown={preventHyphen}
            />
          );
        }
        return displayValue(row.high);
      },
    },
    {
      headerName: "Ancho [m]",
      field: "broad",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <input
              type="number"
              min={0}
              className="form-control"
              value={editingRow.broad}
              onChange={(e) =>
                handleRowFieldChange("broad", Number(e.target.value))
              }
              onKeyDown={preventHyphen}
            />
          );
        }
        return displayValue(row.broad);
      },
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: DoorData) => {
        if (editingRow && editingRow.id === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={handleAccept}
              onCancel={handleCancel}
            />
          );
        }
        return (
          <ActionButtons
            onEdit={() => handleEdit(row)}
            onDelete={() => {
              setDeletingRow(row);
              setShowDeleteModal(true);
            }}
            onThermalBridge={() => handleThermicBridgesDoor(row)}
          />
        );
      },
    },
    // Columnas FAV
    /* {
      headerName: "D [m]",
      field: "fav1D",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav1D}
            onChange={(e) =>
              handleFavEditChange("fav1D", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav1D)
        ),
      cellStyle: {
        position: "sticky",
        right: "240px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "L [m]",
      field: "fav1L",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav1L}
            onChange={(e) =>
              handleFavEditChange("fav1L", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav1L)
        ),
      cellStyle: {
        position: "sticky",
        right: "160px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "P [m]",
      field: "fav2izqP",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2izqP}
            onChange={(e) =>
              handleFavEditChange("fav2izqP", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav2izqP)
        ),
      cellStyle: {
        position: "sticky",
        right: "80px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "S [m]",
      field: "fav2izqS",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2izqS}
            onChange={(e) =>
              handleFavEditChange("fav2izqS", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav2izqS)
        ),
      cellStyle: {
        position: "sticky",
        right: "0px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "P [m]",
      field: "fav2DerP",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2DerP}
            onChange={(e) =>
              handleFavEditChange("fav2DerP", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav2DerP)
        ),
      cellStyle: {
        position: "sticky",
        right: "-80px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "S [m]",
      field: "fav2DerS",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2DerS}
            onChange={(e) =>
              handleFavEditChange("fav2DerS", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav2DerS)
        ),
      cellStyle: {
        position: "sticky",
        right: "-160px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "E [m]",
      field: "fav3E",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3E}
            onChange={(e) =>
              handleFavEditChange("fav3E", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav3E)
        ),
      cellStyle: {
        position: "sticky",
        right: "-240px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "T [m]",
      field: "fav3T",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3T}
            onChange={(e) =>
              handleFavEditChange("fav3T", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav3T)
        ),
      cellStyle: {
        position: "sticky",
        right: "-320px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "β [°]",
      field: "fav3Beta",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3Beta}
            onChange={(e) =>
              handleFavEditChange("fav3Beta", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav3Beta)
        ),
      cellStyle: {
        position: "sticky",
        right: "-400px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "α [°]",
      field: "fav3Alpha",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3Alpha}
            onChange={(e) =>
              handleFavEditChange("fav3Alpha", Number(e.target.value))
            }
            onKeyDown={preventHyphen}
          />
        ) : (
          displayValue(row.fav3Alpha)
        ),
      cellStyle: {
        position: "sticky",
        right: "-480px",
        background: "#fff",
        zIndex: 1,
      },
    }, 
    // La columna de acciones FAV se mueve al final
    {
      headerName: "Acciones FAV",
      field: "acciones_fav",
      renderCell: (row: DoorData) =>
        editingFavRow === row.id ? (
          <ActionButtonsConfirm
            onAccept={handleConfirmEditFav}
            onCancel={() => {
              setEditingFavRow(null);
              setFavEditData(null);
            }}
          />
        ) : (
          <CustomButton
            variant="editIcon"
            onClick={() => handleFavEditClick(row)}
          >
            Editar FAV
          </CustomButton>
        ),
    },*/
  ];

  const multiHeader = {
    rows: [
      [
        { label: "Tipo de Puerta", rowSpan: 2 },
        { label: "Características espacio contiguo al elemento", rowSpan: 2 },
        { label: "Ángulo Azimut", rowSpan: 2 },
        { label: "Orientación", rowSpan: 2 },
        { label: "Alto [m]", rowSpan: 2 },
        { label: "Ancho [m]", rowSpan: 2 },
        { label: "Acciones", rowSpan: 2 },
        /*         { label: "FAV 1", colSpan: 2 },
        { label: "FAV 2 izq", colSpan: 2 },
        { label: "FAV 2 Der", colSpan: 2 },
        { label: "FAV 3", colSpan: 4 },
        { label: "Acciones FAV", rowSpan: 2 }, */
      ],
      /* [
        { label: "D [m]" },
        { label: "L [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "E [m]" },
        { label: "T [m]" },
        { label: "β [°]" },
        { label: "α [m]" },
      ], */
    ],
  };

  return (
    <div>
      <div style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-end gap-2 w-100">
          <CustomButton variant="save" onClick={handleCreate}>
            <Plus className="me-1" size={16} />
            Nueva Puerta
          </CustomButton>
        </div>
      </div>
      <TablesParameters
        columns={columns}
        data={data}
        multiHeader={multiHeader}
      />

      {/* Modal para crear nueva puerta */}
      <ModalCreate
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        saveLabel="Crear Puerta"
        title="Crear Puerta"
      >
        <div className="container">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="doorId">Tipo de Puerta</label>
            </div>
            <div className="col-md-8">
              <select
                id="doorId"
                className="form-control"
                value={doorId}
                onChange={(e) => setDoorId(Number(e.target.value))}
              >
                <option value={0}>Seleccione una puerta</option>
                {doorOptions.map((door: any) => (
                  <option key={door.id} value={door.id}>
                    {door.name_element}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="characteristics">Características</label>
            </div>
            <div className="col-md-8">
              <select
                id="characteristics"
                className="form-control"
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
              >
                <option value="">Seleccione una opción</option>
                <option value="Exterior">Exterior</option>
                <option value="Inter Recintos Clim">Inter Recintos Clim</option>
                <option value="Inter Recintos No Clim">
                  Inter Recintos No Clim
                </option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="anguloAzimut">Ángulo Azimut</label>
            </div>
            <div className="col-md-8">
              <select
                id="anguloAzimut"
                className="form-control"
                value={anguloAzimut}
                onChange={(e) => setAnguloAzimut(e.target.value)}
              >
                <option value="">Seleccione un ángulo</option>
                {angleOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="high">Alto [m]</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="high"
                className="form-control"
                value={high}
                min="0"
                onKeyDown={(e) => {
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setHigh(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="broad">Ancho [m]</label>
            </div>
            <div className="col-md-8">
              <input
                type="number"
                id="broad"
                className="form-control"
                value={broad}
                onChange={(e) => setBroad(Number(e.target.value))}
                min="0"
                onKeyDown={(e) => {
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </ModalCreate>

      {/* Modal para confirmar eliminación de puerta */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingRow(null);
        }}
        onSave={handleDeleteConfirm}
        saveLabel="Eliminar"
        title="Confirmar Eliminación"
      >
        <div className="container">
          <div className="row mb-3">
            <p>
              ¿Está seguro que desea eliminar la puerta{" "}
              <strong>{deletingRow?.tipoPuente}</strong>?
            </p>
          </div>
        </div>
      </ModalCreate>
      <ThermalBridgesDoorModal
        isOpen={showModalThermicBridges}
        handleClose={handleCloseEditBridge}
        bridgeId={favEditData?.fav_id}
        bridgeData={favEditData}
        // detailOptions={details}
        onSaveSuccess={fetchDoorData}
      />
    </div>
  );
};

export default TabDoorCreate;
