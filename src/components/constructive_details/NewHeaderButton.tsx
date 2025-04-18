// NewHeaderButton.tsx
import React, { useState } from "react";
import CustomButton from "@/components/common/CustomButton";
import ModalCreate from "@/components/common/ModalCreate";
import axios from "axios";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

export interface NewHeaderButtonProps {
  /**
   * Tipo de detalle: 'muros', 'techumbre' o 'pisos'
   */
  tab: "muros" | "techumbre" | "pisos";
  /**
   * Callback que se dispara luego de crear el detalle de forma exitosa, por ejemplo para refrescar la tabla.
   */
  onNewCreated?: () => void;
}

const titleMapping: { [key in NewHeaderButtonProps["tab"]]: string } = {
  muros: "Muro",
  techumbre: "Techo",
  pisos: "Piso",
};

const NewHeaderButton: React.FC<NewHeaderButtonProps> = ({ tab, onNewCreated }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDetalle, setNewDetalle] = useState({
    name_detail: "",
    colorExterior: "Intermedio",
    colorInterior: "Intermedio",
  });

  // Función de obtención del token desde localStorage.
  const getToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado", "Inicia sesión.");
    }
    return token;
  };

  // Función para guardar el nuevo detalle.
  const handleSaveDetalle = async () => {
    if (!newDetalle.name_detail.trim()) {
      notify("Por favor, complete el nombre del detalle.");
      return;
    }
    const projectId = localStorage.getItem("project_id");
    const token = getToken();
    if (!token || !projectId) return;

    // Se determina el tipo de detalle a crear
    const type = titleMapping[tab] || "Muro";

    // Se define el payload según el tipo; en caso de 'Piso', se envían los valores de aislamiento
    let payload;
    if (type === "Piso") {
      payload = {
        name_detail: newDetalle.name_detail,
        info: {
          ref_aisl_vertical: { d: 0, e_aisl: 0, lambda: 0 },
          ref_aisl_horizontal: { d: 0, e_aisl: 0, lambda: 0 },
        },
      };
    } else {
      payload = {
        name_detail: newDetalle.name_detail,
        info: {
          surface_color: {
            interior: { name: newDetalle.colorInterior },
            exterior: { name: newDetalle.colorExterior },
          },
        },
      };
    }

    try {
      const url = `${constantUrlApiEndpoint}/user/${type}/detail-part-create?project_id=${projectId}`;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      await axios.post(url, payload, { headers });
      notify(`Detalle de ${type} creado exitosamente.`);
      // Se cierra el modal y se reinicia el formulario
      setShowCreateModal(false);
      setNewDetalle({ name_detail: "", colorExterior: "Intermedio", colorInterior: "Intermedio" });
      if (onNewCreated) onNewCreated();
    } catch (error) {
      console.error("Error al crear el detalle constructivo:", error);
      notify("Ya existe un detalle con el nombre asignado.");
    }
  };

  return (
    <>
      <CustomButton variant="save" onClick={() => setShowCreateModal(true)}>
        + Nuevo
      </CustomButton>
      {showCreateModal && (
        <ModalCreate
          isOpen={true}
          title={`Crear nueva cabecera de ${titleMapping[tab]}`}
          onClose={() => {
            setShowCreateModal(false);
            setNewDetalle({ name_detail: "", colorExterior: "Intermedio", colorInterior: "Intermedio" });
          }}
          onSave={handleSaveDetalle}
        >
          <form>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                value={newDetalle.name_detail}
                onChange={(e) => setNewDetalle({ ...newDetalle, name_detail: e.target.value })}
              />
            </div>
            {/* Solo se muestran los campos de color para Muro y Techo */}
            {tab !== "pisos" && (
              <>
                <div className="form-group">
                  <label>Color Exterior</label>
                  <select
                    className="form-control"
                    value={newDetalle.colorExterior}
                    onChange={(e) =>
                      setNewDetalle({ ...newDetalle, colorExterior: e.target.value })
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
                    value={newDetalle.colorInterior}
                    onChange={(e) =>
                      setNewDetalle({ ...newDetalle, colorInterior: e.target.value })
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

export default NewHeaderButton;
