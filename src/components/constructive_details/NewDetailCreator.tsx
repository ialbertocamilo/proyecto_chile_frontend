// NewDetailCreator.tsx
import React, { useState } from "react";
import axios from "axios";
import ModalCreate from "@/components/common/ModalCreate";
import CustomButton from "@/components/common/CustomButton";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

export type DetailType = "Muro" | "Techo" | "Piso";

interface NewDetailCreatorProps {
  /**
   * Tipo de detalle a crear: puede ser "Muro", "Techo" o "Piso".
   * Este valor se usa para construir el endpoint y definir el formulario.
   */
  detailType: DetailType;
  /**
   * Función callback que se ejecuta una vez se haya creado el detalle.
   * Por ejemplo, para refrescar la tabla de detalles.
   */
  onDetailCreated: () => void;
}

/**
 * Componente que encapsula el botón de creación de un nuevo detalle constructivo.
 * Al hacer clic en el botón se abre un modal con el formulario correspondiente y se ejecuta
 * la llamada al endpoint indicado para crear el detalle en la base de datos.
 */
const NewDetailCreator: React.FC<NewDetailCreatorProps> = ({
  detailType,
  onDetailCreated,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newDetail, setNewDetail] = useState({
    name_detail: "",
    colorInterior: "Intermedio",
    colorExterior: "Intermedio",
  });

  const getToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  const handleSaveDetail = async () => {
    // Validaciones: se requiere el nombre del detalle y, para Muro/Techo, los colores
    if (!newDetail.name_detail.trim()) {
      notify("Por favor, complete el campo de nombre.");
      return;
    }
    if (
      detailType !== "Piso" &&
      (!newDetail.colorInterior || !newDetail.colorExterior)
    ) {
      notify("Por favor, complete los campos de color interior y exterior.");
      return;
    }

    const token = getToken();
    if (!token) return;

    let payload;
    if (detailType === "Piso") {
      // Para pisos se envía un payload con datos de aislamiento en 0
      payload = {
        name_detail: newDetail.name_detail,
        info: {
          ref_aisl_vertical: { d: 0, e_aisl: 0, lambda: 0 },
          ref_aisl_horizontal: { d: 0, e_aisl: 0, lambda: 0 },
        },
      };
    } else {
      // Para muros y techos se envían los colores interior y exterior
      payload = {
        name_detail: newDetail.name_detail,
        info: {
          surface_color: {
            interior: { name: newDetail.colorInterior },
            exterior: { name: newDetail.colorExterior },
          },
        },
      };
    }

    try {
      const url = `${constantUrlApiEndpoint}/admin/${detailType}/detail-part-create`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      await axios.post(url, payload, { headers });
      notify("Detalle creado exitosamente.");
      // Ejecuta el callback para actualizar la lista de detalles (o cualquier acción deseada)
      onDetailCreated();
      // Cierra el modal y resetea el formulario
      setShowModal(false);
      setNewDetail({
        name_detail: "",
        colorExterior: "Intermedio",
        colorInterior: "Intermedio",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error al crear detalle constructivo:",
          error.response || error
        );
        if (
          error.response &&
          error.response.data &&
          error.response.data.detail
        ) {
          notify(error.response.data.detail);
        } else {
          notify("Error al crear el Detalle Constructivo.");
        }
      } else if (error instanceof Error) {
        console.error("Error al crear detalle constructivo:", error.message);
        notify("Error al crear el Detalle Constructivo.");
      } else {
        console.error("Error al crear detalle constructivo:", error);
      }
    }
  };

  return (
    <>
      {/* Botón que abre el modal para crear nuevo detalle */}
      <CustomButton variant="save" onClick={() => setShowModal(true)}>
        + Nuevo
      </CustomButton>

      {showModal && (
        <ModalCreate
          isOpen={true}
          title={`Crear Nuevo ${detailType}`}
          onClose={() => {
            setShowModal(false);
            // Resetea el formulario al cerrar el modal
            setNewDetail({
              name_detail: "",
              colorExterior: "Intermedio",
              colorInterior: "Intermedio",
            });
          }}
          onSave={handleSaveDetail}
          saveLabel={`Crear ${detailType}`}
        >
          <form>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                value={newDetail.name_detail}
                onChange={(e) =>
                  setNewDetail((prev) => ({
                    ...prev,
                    name_detail: e.target.value,
                  }))
                }
              />
            </div>
            {/* Se muestran los campos de color solo si el tipo no es Piso */}
            {detailType !== "Piso" && (
              <>
                <div className="form-group">
                  <label>Color Exterior</label>
                  <select
                    className="form-control"
                    value={newDetail.colorExterior}
                    onChange={(e) =>
                      setNewDetail((prev) => ({
                        ...prev,
                        colorExterior: e.target.value,
                      }))
                    }
                  >
                    <option value="Claro">Claro</option>
                    <option value="Oscuro">Oscuro</option>
                    <option value="Intermedio">Intermedio</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Color Interior</label>
                  <select
                    className="form-control"
                    value={newDetail.colorInterior}
                    onChange={(e) =>
                      setNewDetail((prev) => ({
                        ...prev,
                        colorInterior: e.target.value,
                      }))
                    }
                  >
                    <option value="Claro">Claro</option>
                    <option value="Oscuro">Oscuro</option>
                    <option value="Intermedio">Intermedio</option>
                  </select>
                </div>
              </>
            )}
          </form>
        </ModalCreate>
      )}
    </>
  );
};

export default NewDetailCreator;
