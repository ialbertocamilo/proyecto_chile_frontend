import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

const TabWindowCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id");
  const projectId = localStorage.getItem("project_id_edit");
  const token = localStorage.getItem("token") || "";

  // Función para formatear valores: si es 0 o "N/A" devuelve "-"
  const formatValue = (value: any, decimals: number = 2) => {
    if (value === 0 || value === "N/A") return "-";
    if (typeof value === "number") return value.toFixed(decimals);
    return value;
  };

  // Estados para edición de ventana
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // Estados para edición de FAV (independiente)
  const [editingFavRow, setEditingFavRow] = useState<number | null>(null);
  const [favEditData, setFavEditData] = useState<any>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);

  const initialFormData = {
    window_id: 0,
    characteristics: "",
    angulo_azimut: "",
    housed_in: 0,
    position: "",
    with_no_return: "",
    high: 0,
    broad: 0,
  };
  const [formData, setFormData] = useState(initialFormData);

  const characteristicsOptions = [
    "Exterior",
    "Inter Recintos Clim",
    "Inter Recintos No Clim",
  ];
  const withNoReturnOptions = ["Sin", "Con"];
  const positionOptions = ["Interior", "Centrada", "Exterior"];

  // Estados para almacenar datos de endpoints
  const [details, setDetails] = useState<any[]>([]);
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  const [windowOptions, setWindowOptions] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);

  // Obtener detalles
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `${constantUrlApiEndpoint}/project/${projectId}/details`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Error al obtener los detalles");
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDetails();
  }, [projectId, token]);

  // Obtener opciones de ángulo
  useEffect(() => {
    const fetchAngleOptions = async () => {
      try {
        const response = await fetch(`${constantUrlApiEndpoint}/angle-azimut`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok)
          throw new Error("Error al obtener las opciones de ángulo");
        const data = await response.json();
        setAngleOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAngleOptions();
  }, [token]);

  // Obtener elementos de ventana
  useEffect(() => {
    const fetchWindowOptions = async () => {
      try {
        const response = await fetch(
          `${constantUrlApiEndpoint}/user/elements/?type=window`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error("Error al obtener los elementos de ventana");
        const data = await response.json();
        setWindowOptions(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWindowOptions();
  }, [token]);

  // Obtener ventanas y FAVs
  const fetchWindowEnclosures = async () => {
    try {
      const response = await fetch(
        `${constantUrlApiEndpoint}/window-enclosures/${enclosure_id}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al obtener las ventanas");
      const windowsData = await response.json();

      let mappedData = windowsData.map((item: any) => {
        // Buscar el nombre del elemento de ventana correspondiente
        const windowElement = windowOptions.find(
          (window: any) => window.id === item.window_id
        );
        const windowName = windowElement
          ? windowElement.name_element
          : `Ventana ${item.window_id}`;

        return {
          id: item.id,
          window_id: item.window_id,
          tipoVano: windowName, // Muestra el nombre correcto de la ventana
          caracteristicas: item.characteristics,
          anguloAzimut: item.angulo_azimut,
          orientacion: item.orientation,
          alojadoEn: item.housed_in,
          tipoCierre: item.clousure_type, // lectura
          posicionVentanal: item.position,
          aislacion: item.with_no_return,
          alto: item.high,
          ancho: item.broad,
          marco: item.frame,
          // Inicializamos FAV
          fav1_D: "",
          fav1_L: "",
          fav2izq_P: "",
          fav2izq_S: "",
          fav2der_P: "",
          fav2der_S: "",
          fav3_E: "",
          fav3_T: "",
          fav3_beta: "",
          fav3_alpha: "",
          fav_id: null,
        };
      });

      const favResponse = await fetch(
        `${constantUrlApiEndpoint}/window/fav-enclosures/${enclosure_id}/`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!favResponse.ok)
        throw new Error("Error al obtener los favs de ventana");
      const favsData = await favResponse.json();

      mappedData = mappedData.map((row: any) => {
        const fav = favsData.find((f: any) => f.item_id === row.id);
        if (fav) {
          return {
            ...row,
            fav1_D: fav.fav1.d,
            fav1_L: fav.fav1.l,
            fav2izq_P: fav.fav2_izq.p,
            fav2izq_S: fav.fav2_izq.s,
            fav2der_P: fav.fav2_der.p,
            fav2der_S: fav.fav2_der.s,
            fav3_E: fav.fav3.e,
            fav3_T: fav.fav3.t,
            fav3_beta: fav.fav3.beta,
            fav3_alpha: fav.fav3.alfa,
            fav_id: fav.id,
          };
        }
        return row;
      });

      setTableData(mappedData);
    } catch (error) {
      console.error(error);
    }
  };

  // Ejecutar fetchWindowEnclosures solo cuando windowOptions ya esté cargado
  useEffect(() => {
    if (windowOptions.length > 0) {
      fetchWindowEnclosures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enclosure_id, token, windowOptions]);

  const validateForm = () => {
    if (!formData.window_id || formData.window_id === 0) return false;
    if (!formData.characteristics) return false;
    if (!formData.angulo_azimut) return false;
    if (!formData.housed_in || formData.housed_in === 0) return false;
    if (!formData.position) return false;
    if (!formData.with_no_return) return false;
    if (!formData.high || formData.high < 0) return false;
    if (!formData.broad || formData.broad < 0) return false;
    return true;
  };

  // Modal de creación
  const handleCreateWindow = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "housed_in" || name === "window_id"
          ? Number(value)
          : value,
    });
  };

  const handleSaveModal = async () => {
    if (!validateForm()) {
      notify("Por favor, complete todos los campos (sin números negativos).");
      return;
    }
    const url = `${constantUrlApiEndpoint}/window-enclosures-create/${enclosure_id}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Error en la creación de la ventana");
      const dataResponse = await response.json();
      console.log("Ventana creada:", dataResponse);
      notify("Ventana creada exitosamente");
      setFormData(initialFormData);
      setShowModal(false);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      notify("Error al crear la ventana");
    }
  };

  // Eliminar ventana
  const handleDeleteClick = (row: any) => {
    setRowToDelete(row);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    const url = `${constantUrlApiEndpoint}/window-enclosures-delete/${rowToDelete.id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al eliminar la ventana");
      const dataResponse = await response.json();
      console.log("Eliminación:", dataResponse);
      notify(dataResponse.detail || "Ventana eliminada exitosamente");
      setShowDeleteModal(false);
      setRowToDelete(null);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      notify("Error al eliminar la ventana");
    }
  };

  // Edición de ventana
  const handleEditClick = (row: any) => {
    setEditingRow(row.id);
    setEditData({
      window_id: row.window_id,
      characteristics: row.caracteristicas,
      angulo_azimut: row.anguloAzimut,
      housed_in: row.alojadoEn,
      position: row.posicionVentanal,
      with_no_return: row.aislacion,
      high: row.alto,
      broad: row.ancho,
    });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConfirmEditWindow = async (id: number) => {
    const url = `${constantUrlApiEndpoint}/window-enclosures-update/${id}`;
    try {
      if (editData.high < 0 || editData.broad < 0) {
        notify("No se permiten valores negativos en altura o ancho");
        return;
      }
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          window_id: editData.window_id,
          characteristics: editData.characteristics,
          angulo_azimut: editData.angulo_azimut,
          housed_in: editData.housed_in,
          position: editData.position,
          with_no_return: editData.with_no_return,
          high: editData.high,
          broad: editData.broad,
        }),
      });
      if (!response.ok) throw new Error("Error al actualizar la ventana");
      const dataResponse = await response.json();
      console.log("Actualización ventana:", dataResponse);
      notify("Ventana actualizada exitosamente");
      setEditingRow(null);
      setEditData(null);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      notify("Error al actualizar la ventana");
    }
  };

  // Edición de FAV
  const handleFavEditClick = (row: any) => {
    setEditingFavRow(row.id);
    setFavEditData({
      fav_id: row.fav_id,
      fav1_D: row.fav1_D,
      fav1_L: row.fav1_L,
      fav2izq_P: row.fav2izq_P,
      fav2izq_S: row.fav2izq_S,
      fav2der_P: row.fav2der_P,
      fav2der_S: row.fav2der_S,
      fav3_E: row.fav3_E,
      fav3_T: row.fav3_T,
      fav3_beta: row.fav3_beta,
      fav3_alpha: row.fav3_alpha,
    });
  };

  const handleFavEditChange = (field: string, value: any) => {
    setFavEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleConfirmEditFav = async () => {
    const {
      fav1_D, fav1_L, fav2izq_P, fav2izq_S, fav2der_P, fav2der_S,
      fav3_E, fav3_T, fav3_beta, fav3_alpha
    } = favEditData;

    if (
      fav1_D < 0 || fav1_L < 0 ||
      fav2izq_P < 0 || fav2izq_S < 0 ||
      fav2der_P < 0 || fav2der_S < 0 ||
      fav3_E < 0 || fav3_T < 0 ||
      fav3_beta < 0 || fav3_alpha < 0
    ) {
      notify("No se permiten valores negativos en FAV");
      return;
    }

    const favUrl = `${constantUrlApiEndpoint}/window/fav-enclosures-update/${favEditData.fav_id}`;
    try {
      const response = await fetch(favUrl, {
        method: "PUT",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fav1: {
            d: fav1_D,
            l: fav1_L,
          },
          fav2_izq: {
            p: fav2izq_P,
            s: fav2izq_S,
          },
          fav2_der: {
            p: fav2der_P,
            s: fav2der_S,
          },
          fav3: {
            e: fav3_E,
            t: fav3_T,
            beta: fav3_beta,
            alfa: fav3_alpha,
          },
        }),
      });
      if (!response.ok) throw new Error("Error al actualizar los favs");
      const favDataResponse = await response.json();
      console.log("Actualización FAV:", favDataResponse);
      notify("FAV actualizado exitosamente");
      setEditingFavRow(null);
      setFavEditData(null);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      notify("Error al actualizar los favs");
    }
  };

  // Estilo para inputs de FAV
  const favInputStyle = {
    height: "20px",
    fontSize: "14px",
    width: "120px",
  };

  const columns = [
    {
      headerName: "Tipo de vano Acristalado (incluye marco)",
      field: "tipoVano",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.window_id}
            onChange={(e) => handleEditChange("window_id", Number(e.target.value))}
          >
            <option value={0}>Seleccione un elemento</option>
            {windowOptions.map((element: any) => (
              <option key={element.id} value={element.id}>
                {element.name_element}
              </option>
            ))}
          </select>
        ) : (
          row.tipoVano
        ),
    },
    {
      headerName: "Características espacio contiguo el elemento",
      field: "caracteristicas",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.characteristics}
            onChange={(e) => handleEditChange("characteristics", e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {characteristicsOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          row.caracteristicas
        ),
    },
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.angulo_azimut}
            onChange={(e) => handleEditChange("angulo_azimut", e.target.value)}
          >
            <option value="">Seleccione un ángulo</option>
            {angleOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          row.anguloAzimut
        ),
    },
    {
      headerName: "Orientación",
      field: "orientacion",
      renderCell: (row: any) => row.orientacion,
    },
    {
      headerName: "Alojado en",
      field: "alojadoEn",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.housed_in}
            onChange={(e) => handleEditChange("housed_in", Number(e.target.value))}
          >
            <option value={0}>Seleccione un detalle</option>
            {details.map((detail: any) => (
              <option key={detail.id} value={detail.id}>
                {detail.name_detail}
              </option>
            ))}
          </select>
        ) : (
          row.alojadoEn
        ),
    },
    {
      headerName: "Tipo de Cierre",
      field: "tipoCierre",
      renderCell: (row: any) => row.tipoCierre,
    },
    {
      headerName: "Posición Ventanal",
      field: "posicionVentanal",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.position}
            onChange={(e) => handleEditChange("position", e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {positionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          row.posicionVentanal
        ),
    },
    {
      headerName: "Aislación Con/sin retorno",
      field: "aislacion",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <select
            className="form-control"
            value={editData.with_no_return}
            onChange={(e) => handleEditChange("with_no_return", e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {withNoReturnOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          row.aislacion
        ),
    },
    {
      headerName: "Alto (H) [m]",
      field: "alto",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            value={editData.high}
            onChange={(e) => handleEditChange("high", Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}
          />
        ) : (
          formatValue(row.alto)
        ),
    },
    {
      headerName: "Ancho (W) [m]",
      field: "ancho",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            value={editData.broad}
            onChange={(e) => handleEditChange("broad", Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "-") {
                e.preventDefault();
              }
            }}
          />
        ) : (
          formatValue(row.ancho)
        ),
    },
    {
      headerName: "Marco",
      field: "marco",
      renderCell: (row: any) => row.marco,
    },
    {
      headerName: "Acciones Ventana",
      field: "acciones",
      renderCell: (row: any) =>
        editingRow === row.id ? (
          <ActionButtonsConfirm
            onAccept={() => handleConfirmEditWindow(row.id)}
            onCancel={() => {
              setEditingRow(null);
              setEditData(null);
            }}
          />
        ) : (
          <ActionButtons
            onEdit={() => handleEditClick(row)}
            onDelete={() => handleDeleteClick(row)}
          />
        ),
    },
    // ========================================
    // FAV (con inputs sin permitir negativos y formateo de valores)
    {
      headerName: "D [m]",
      field: "fav1_D",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav1_D}
            onChange={(e) =>
              handleFavEditChange("fav1_D", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav1_D)
        ),
      cellStyle: {
        position: "sticky",
        right: "840px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "L [m]",
      field: "fav1_L",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav1_L}
            onChange={(e) =>
              handleFavEditChange("fav1_L", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav1_L)
        ),
      cellStyle: {
        position: "sticky",
        right: "760px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "P [m]",
      field: "fav2izq_P",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2izq_P}
            onChange={(e) =>
              handleFavEditChange("fav2izq_P", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav2izq_P)
        ),
      cellStyle: {
        position: "sticky",
        right: "680px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "S [m]",
      field: "fav2izq_S",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2izq_S}
            onChange={(e) =>
              handleFavEditChange("fav2izq_S", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav2izq_S)
        ),
      cellStyle: {
        position: "sticky",
        right: "600px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "P [m]",
      field: "fav2der_P",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2der_P}
            onChange={(e) =>
              handleFavEditChange("fav2der_P", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav2der_P)
        ),
      cellStyle: {
        position: "sticky",
        right: "520px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "S [m]",
      field: "fav2der_S",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav2der_S}
            onChange={(e) =>
              handleFavEditChange("fav2der_S", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav2der_S)
        ),
      cellStyle: {
        position: "sticky",
        right: "440px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "E [m]",
      field: "fav3_E",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3_E}
            onChange={(e) =>
              handleFavEditChange("fav3_E", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav3_E)
        ),
      cellStyle: {
        position: "sticky",
        right: "360px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "T [m]",
      field: "fav3_T",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3_T}
            onChange={(e) =>
              handleFavEditChange("fav3_T", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav3_T)
        ),
      cellStyle: {
        position: "sticky",
        right: "280px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "β [°]",
      field: "fav3_beta",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3_beta}
            onChange={(e) =>
              handleFavEditChange("fav3_beta", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav3_beta)
        ),
      cellStyle: {
        position: "sticky",
        right: "200px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "α [°]",
      field: "fav3_alpha",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <input
            type="number"
            min="0"
            step="any"
            className="form-control"
            style={favInputStyle}
            value={favEditData.fav3_alpha}
            onChange={(e) =>
              handleFavEditChange("fav3_alpha", Number(e.target.value))
            }
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        ) : (
          formatValue(row.fav3_alpha)
        ),
      cellStyle: {
        position: "sticky",
        right: "120px",
        background: "#fff",
        zIndex: 1,
      },
    },
    {
      headerName: "Acciones FAV",
      field: "acciones_fav",
      renderCell: (row: any) =>
        editingFavRow === row.id ? (
          <ActionButtonsConfirm
            onAccept={handleConfirmEditFav}
            onCancel={() => {
              setEditingFavRow(null);
              setFavEditData(null);
            }}
          />
        ) : (
          <CustomButton variant="editIcon" onClick={() => handleFavEditClick(row)}>
            Editar FAV
          </CustomButton>
        ),
      cellStyle: {
        position: "sticky",
        right: "0px",
        background: "#fff",
        zIndex: 1,
      },
    },
  ];

  const multiHeader = {
    rows: [
      [
        { label: "Tipo de vano Acristalado (incluye marco)", rowSpan: 2 },
        { label: "Características espacio contiguo el elemento", rowSpan: 2 },
        { label: "Ángulo Azimut", rowSpan: 2 },
        { label: "Orientación", rowSpan: 2 },
        { label: "Alojado en", rowSpan: 2 },
        { label: "Tipo de Cierre", rowSpan: 2 },
        { label: "Posición Ventanal", rowSpan: 2 },
        { label: "Aislación Con/sin retorno", rowSpan: 2 },
        { label: "Alto (H) [m]", rowSpan: 2 },
        { label: "Ancho (W) [m]", rowSpan: 2 },
        { label: "Marco", rowSpan: 2 },
        { label: "Acciones Ventana", rowSpan: 2 },
        { label: "FAV 1", colSpan: 2 },
        { label: "FAV 2 izq", colSpan: 2 },
        { label: "FAV 2 Der", colSpan: 2 },
        { label: "FAV 3", colSpan: 4 },
        { label: "Acciones FAV", rowSpan: 2 },
      ],
      [
        { label: "D [m]" },
        { label: "L [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "P [m]" },
        { label: "S [m]" },
        { label: "E [m]" },
        { label: "T [m]" },
        { label: "β [°]" },
        { label: "α [°]" },
      ],
    ],
  };

  return (
    <div>
      <TablesParameters
        columns={columns}
        data={tableData}
        multiHeader={multiHeader}
      />
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div className="d-flex justify-content-end gap-2 w-100"></div>
        <CustomButton variant="save" onClick={handleCreateWindow}>
          Crear Ventana
        </CustomButton>
      </div>
      {/* Modal de creación */}
      <ModalCreate
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        title="Crear Ventana"
        saveLabel="Grabar Datos"
      >
        <form>
          <div className="row mb-3">
            <label htmlFor="window_id" className="col-sm-5 col-form-label">
              Ventana
            </label>
            <div className="col-sm-6">
              <select
                id="window_id"
                name="window_id"
                className="form-control"
                value={formData.window_id}
                onChange={handleInputChange}
              >
                <option value={0}>Seleccione un elemento</option>
                {windowOptions.map((element: any) => (
                  <option key={element.id} value={element.id}>
                    {element.name_element}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label
              htmlFor="characteristics"
              className="col-sm-5 col-form-label"
            >
              Características
            </label>
            <div className="col-sm-6">
              <select
                id="characteristics"
                name="characteristics"
                className="form-control"
                value={formData.characteristics}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una opción</option>
                {characteristicsOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="angulo_azimut" className="col-sm-5 col-form-label">
              Ángulo Azimut
            </label>
            <div className="col-sm-6">
              <select
                id="angulo_azimut"
                name="angulo_azimut"
                className="form-control"
                value={formData.angulo_azimut}
                onChange={handleInputChange}
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
          {/* Tipo de cierre se omite (viene de la DB) */}
          <div className="row mb-3">
            <label htmlFor="housed_in" className="col-sm-5 col-form-label">
              Alojada en
            </label>
            <div className="col-sm-6">
              <select
                id="housed_in"
                name="housed_in"
                className="form-control"
                value={formData.housed_in}
                onChange={handleInputChange}
              >
                <option value={0}>Seleccione un detalle</option>
                {details.map((detail: any) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.name_detail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="position" className="col-sm-5 col-form-label">
              Posición
            </label>
            <div className="col-sm-6">
              <select
                id="position"
                name="position"
                className="form-control"
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una opción</option>
                {positionOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="with_no_return" className="col-sm-5 col-form-label">
              Aislacion con/sin retorno
            </label>
            <div className="col-sm-6">
              <select
                id="with_no_return"
                name="with_no_return"
                className="form-control"
                value={formData.with_no_return}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una opción</option>
                {withNoReturnOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="high" className="col-sm-5 col-form-label">
              Alto [m]
            </label>
            <div className="col-sm-6">
              <input
                type="number"
                min="0"
                step="any"
                id="high"
                name="high"
                className="form-control"
                value={formData.high}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="broad" className="col-sm-5 col-form-label">
              Ancho [m]
            </label>
            <div className="col-sm-6">
              <input
                type="number"
                min="0"
                step="any"
                id="broad"
                name="broad"
                className="form-control"
                value={formData.broad}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "-") {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        </form>
      </ModalCreate>
      {/* Modal de eliminación */}
      <ModalCreate
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSave={handleConfirmDelete}
        title="Confirmar Eliminación"
        saveLabel="Eliminar"
      >
        <div>
          {rowToDelete ? (
            <p>
              ¿Está seguro que desea eliminar la ventana:{" "}
              <strong>{rowToDelete.tipoVano}</strong>?
            </p>
          ) : (
            <p>No se ha seleccionado ventana para eliminar</p>
          )}
        </div>
      </ModalCreate>
    </div>
  );
};

export default TabWindowCreate;
