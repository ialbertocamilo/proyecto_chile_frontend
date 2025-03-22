import React, { useState, useEffect } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import CustomButton from "../common/CustomButton";
import ModalCreate from "../common/ModalCreate";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";

const TabWindowCreate: React.FC = () => {
  const enclosure_id = localStorage.getItem("recinto_id") || "12";
  const projectId = localStorage.getItem("project_id") || "37";
  const token = localStorage.getItem("token") || "";

  const [editingRow, setEditingRow] = useState<number | null>(null);
  // Modal creación
  const [showModal, setShowModal] = useState<boolean>(false);
  // Modal eliminación
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  // Datos para edición en línea
  const [editData, setEditData] = useState<any>(null);

  const initialFormData = {
    window_id: 0,
    characteristics: "",
    angulo_azimut: "",
    housed_in: 0,
    position: "",
    tipoCierre: "",
    with_no_return: "",
    high: 0,
    broad: 0,
  };
  const [formData, setFormData] = useState(initialFormData);

  // Opciones fijas para los campos seleccionables
  const characteristicsOptions = [
    "Exterior",
    "Inter Recintos Clim",
    "Inter Recintos No Clim",
  ];
  const tipoCierreOptions = [
    "Abatir",
    "Corredera",
    "Fija",
    "Guillotina",
    "Proyectante",
  ];
  const withNoReturnOptions = ["Sin", "Con"];
  const positionOptions = ["Interior", "Centrada", "Exterior"];

  // Estados para almacenar datos obtenidos de los endpoints
  const [details, setDetails] = useState<any[]>([]);
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  const [windowOptions, setWindowOptions] = useState<any[]>([]);
  // Datos de la tabla
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
        const response = await fetch(
          `${constantUrlApiEndpoint}/angle-azimut`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Error al obtener las opciones de ángulo");
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
          `${constantUrlApiEndpoint}/elements/?type=window`,
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

  // Obtener ventanas
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
      const data = await response.json();
      // Mapear datos a la tabla (incluye window_id)
      const mappedData = data.map((item: any) => ({
        id: item.id,
        window_id: item.window_id,
        tipoVano: `Ventana ${item.window_id}`,
        caracteristicas: item.characteristics,
        anguloAzimut: item.angulo_azimut,
        orientacion: item.orientation,
        alojadoEn: item.housed_in,
        tipoCierre: item.clousure_type,
        posicionVentanal: item.position,
        aislacion: item.with_no_return,
        alto: item.high,
        ancho: item.broad,
        marco: item.frame,
      }));
      setTableData(mappedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWindowEnclosures();
  }, [enclosure_id, token]);

  // Validación del formulario de creación
  const validateForm = () => {
    if (!formData.window_id || formData.window_id === 0) return false;
    if (!formData.characteristics) return false;
    if (!formData.angulo_azimut) return false;
    if (!formData.tipoCierre) return false;
    if (!formData.housed_in || formData.housed_in === 0) return false;
    if (!formData.position) return false;
    if (!formData.with_no_return) return false;
    if (!formData.high || formData.high <= 0) return false;
    if (!formData.broad || formData.broad <= 0) return false;
    return true;
  };

  // Abrir modal de creación
  const handleCreateWindow = () => {
    setShowModal(true);
  };

  // Cerrar modal de creación
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Cambios en inputs/selects del modal de creación
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "housed_in" || name === "window_id" ? Number(value) : value,
    });
  };

  // Guardar creación vía POST
  const handleSaveModal = async () => {
    if (!validateForm()) {
      notify("Por favor, complete todos los campos. Todos son obligatorios");
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
      if (!response.ok)
        throw new Error("Error en la creación de la ventana");
      const dataResponse = await response.json();
      console.log("Ventana creada:", dataResponse);
      notify("Ventana creada exitosamente");
      setFormData(initialFormData);
      setShowModal(false);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      alert("Error al crear la ventana");
    }
  };

  // Modal de eliminación: abrir confirmación
  const handleDeleteClick = (row: any) => {
    setRowToDelete(row);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación con endpoint DELETE
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
      if (!response.ok)
        throw new Error("Error al eliminar la ventana");
      const dataResponse = await response.json();
      console.log("Eliminación:", dataResponse);
      notify(dataResponse.detail || "Ventana eliminada exitosamente");
      setShowDeleteModal(false);
      setRowToDelete(null);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la ventana");
    }
  };

  // Iniciar edición en línea: se almacena el id y se copia la data a editar
  const handleEditClick = (row: any) => {
    setEditingRow(row.id);
    setEditData({
      window_id: row.window_id,
      characteristics: row.caracteristicas,
      angulo_azimut: row.anguloAzimut,
      housed_in: row.alojadoEn,
      position: row.posicionVentanal,
      tipoCierre: row.tipoCierre, // Campo agregado
      with_no_return: row.aislacion,
      high: row.alto,
      broad: row.ancho,
    });
  };

  // Manejo de cambios en edición en línea (con Bootstrap "form-control")
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Confirmar edición usando endpoint PUT
  const handleConfirmEdit = async (id: number) => {
    const url = `${constantUrlApiEndpoint}/window-enclosures-update/${id}`;
    try {
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
          tipoCierre: editData.tipoCierre,
          with_no_return: editData.with_no_return,
          high: editData.high,
          broad: editData.broad,
        }),
      });
      if (!response.ok)
        throw new Error("Error al actualizar la ventana");
      const dataResponse = await response.json();
      console.log("Actualización:", dataResponse);
      notify("Ventana actualizada exitosamente");
      setEditingRow(null);
      setEditData(null);
      fetchWindowEnclosures();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la ventana");
    }
  };

  // Definición de columnas para la tabla con edición en línea
  const columns = [
    {
      headerName: "Tipo de vano Acristalado (incluye marco)",
      field: "tipoVano",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <select
              className="form-control"
              value={editData.window_id}
              onChange={(e) =>
                handleEditChange("window_id", Number(e.target.value))
              }
            >
              <option value={0}>Seleccione un elemento</option>
              {windowOptions.map((element) => (
                <option key={element.id} value={element.id}>
                  {element.name_element}
                </option>
              ))}
            </select>
          );
        } else {
          return row.tipoVano;
        }
      },
    },
    {
      headerName: "Características espacio contiguo el elemento",
      field: "caracteristicas",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
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
          );
        } else {
          return row.caracteristicas;
        }
      },
    },
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
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
          );
        } else {
          return row.anguloAzimut;
        }
      },
    },
    {
      headerName: "Orientación",
      field: "orientacion",
      renderCell: (row: any) => row.orientacion,
    },
    {
      headerName: "Alojado en",
      field: "alojadoEn",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <select
              className="form-control"
              value={editData.housed_in}
              onChange={(e) =>
                handleEditChange("housed_in", Number(e.target.value))
              }
            >
              <option value={0}>Seleccione un detalle</option>
              {details.map((detail) => (
                <option key={detail.id} value={detail.id}>
                  {detail.name_detail}
                </option>
              ))}
            </select>
          );
        } else {
          return row.alojadoEn;
        }
      },
    },
    {
      headerName: "Tipo de Cierre",
      field: "tipoCierre",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <select
              className="form-control"
              value={editData.tipoCierre}
              onChange={(e) => handleEditChange("tipoCierre", e.target.value)}
            >
              <option value="">Seleccione un tipo</option>
              {tipoCierreOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else {
          return row.tipoCierre;
        }
      },
    },
    {
      headerName: "Posición Ventanal",
      field: "posicionVentanal",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
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
          );
        } else {
          return row.posicionVentanal;
        }
      },
    },
    {
      headerName: "Aislación Con/sin retorno",
      field: "aislacion",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
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
          );
        } else {
          return row.aislacion;
        }
      },
    },
    {
      headerName: "Alto (H) [m]",
      field: "alto",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <input
              className="form-control"
              type="number"
              value={editData.high}
              onChange={(e) => handleEditChange("high", Number(e.target.value))}
            />
          );
        } else {
          return row.alto;
        }
      },
    },
    {
      headerName: "Ancho (W) [m]",
      field: "ancho",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <input
              className="form-control"
              type="number"
              value={editData.broad}
              onChange={(e) => handleEditChange("broad", Number(e.target.value))}
            />
          );
        } else {
          return row.ancho;
        }
      },
    },
    {
      headerName: "Marco",
      field: "marco",
      renderCell: (row: any) => row.marco,
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: any) => {
        if (editingRow === row.id) {
          return (
            <ActionButtonsConfirm
              onAccept={() => handleConfirmEdit(row.id)}
              onCancel={() => {
                setEditingRow(null);
                setEditData(null);
              }}
            />
          );
        } else {
          return (
            <ActionButtons
              onEdit={() => handleEditClick(row)}
              onDelete={() => handleDeleteClick(row)}
            />
          );
        }
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
        { label: "Acciones", rowSpan: 2 },
      ],
    ],
  };

  return (
    <div>
      <TablesParameters columns={columns} data={tableData} multiHeader={multiHeader} />
      <div style={{ marginTop: "1rem" }}>
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
        saveLabel="Crear"
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
                {windowOptions.map((element) => (
                  <option key={element.id} value={element.id}>
                    {element.name_element}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="characteristics" className="col-sm-5 col-form-label">
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
          <div className="row mb-3">
            <label htmlFor="tipoCierre" className="col-sm-5 col-form-label">
              Tipo de Cierre
            </label>
            <div className="col-sm-6">
              <select
                id="tipoCierre"
                name="tipoCierre"
                className="form-control"
                value={formData.tipoCierre}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un tipo</option>
                {tipoCierreOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
                {details.map((detail) => (
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
              Alto
            </label>
            <div className="col-sm-6">
              <input
                type="number"
                step="any"
                id="high"
                name="high"
                className="form-control"
                value={formData.high}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="broad" className="col-sm-5 col-form-label">
              Ancho
            </label>
            <div className="col-sm-6">
              <input
                type="number"
                step="any"
                id="broad"
                name="broad"
                className="form-control"
                value={formData.broad}
                onChange={handleInputChange}
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
              ¿Está seguro que desea eliminar la ventana: <strong>{rowToDelete.tipoVano}</strong>?
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
