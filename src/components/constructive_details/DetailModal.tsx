import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ModalCreate from "@/components/common/ModalCreate";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "@/components/common/CustomButton";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import DeleteDetailButton from "@/components/common/DeleteDetailButton";

export interface Detail {
  id_detail?: number;
  id?: number;
  scantilon_location: string;
  name_detail: string;
  material_id: number;
  material: string;
  layer_thickness: number;
  created_status: string; // "default", "created" o "global"
}

export interface Material {
  id: number;
  name: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { id: number; name_detail: string };
  refreshParent?: () => void;
  materials: Material[];
  fetchMaterials: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  refreshParent,
  materials,
  fetchMaterials,
}) => {
  const [details, setDetails] = useState<Detail[]>([]);
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [editingDetailData, setEditingDetailData] = useState<{
    material_id: number;
    layer_thickness: number;
  }>({
    material_id: 0,
    layer_thickness: 0,
  });

  // Se carga la lista de detalles según el id del elemento seleccionado
  const fetchDetails = useCallback(async () => {
    if (!selectedItem?.id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado, por favor inicia sesión");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${constantUrlApiEndpoint}/detail-part/${selectedItem.id}`,
        { headers }
      );
      setDetails(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
      notify("Error al obtener detalles");
    }
  }, [selectedItem]);

  useEffect(() => {
    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  // Función para crear un nuevo detalle
  const handleNewDetail = async () => {
    if (!selectedItem?.id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      notify("Token no encontrado, por favor inicia sesión");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Se define el objeto con los campos obligatorios requeridos por el backend,
      // incluyendo el created_status como "created"
      const nuevoDetalle = {
        scantilon_location: "Ubicación predeterminada",
        name_detail: "Nuevo Detalle",
        material_id: materials.length > 0 ? materials[0].id : 0,
        layer_thickness: 1,
        created_status: "created",
      };

      await axios.post(
        `${constantUrlApiEndpoint}/admin/detail-create/${selectedItem.id}`,
        nuevoDetalle,
        { headers }
      );
      notify("Detalle creado exitosamente");
      fetchDetails();
      if (refreshParent) {
        refreshParent();
      }
    } catch (error) {
      console.error("Error creating new detail:", error);
      notify("Error al crear detalle");
    }
  };

  // Funciones para la edición en línea
  const handleInlineEdit = (detail: Detail) => {
    const idDetail = detail.id_detail ?? detail.id;
    setEditingDetailId(idDetail || null);
    setEditingDetailData({
      material_id: detail.material_id,
      layer_thickness: detail.layer_thickness,
    });
  };

  const handleConfirmInlineEdit = async (detail: Detail) => {
    const idDetail = detail.id_detail ?? detail.id;
    if (!idDetail) {
      notify("ID de detalle inválido: undefined");
      return;
    }
    if (editingDetailData.material_id <= 0) {
      notify("Por favor, seleccione un material válido.");
      return;
    }
    if (editingDetailData.layer_thickness <= 0) {
      notify("El 'Espesor de capa' debe ser un valor mayor a 0.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notify("Token no encontrado");
        return;
      }
      const url = `${constantUrlApiEndpoint}/admin/detail-update/${idDetail}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const payload = {
        scantilon_location: detail.scantilon_location,
        name_detail: detail.name_detail,
        material_id: editingDetailData.material_id,
        layer_thickness: editingDetailData.layer_thickness,
      };
      await axios.patch(url, payload, { headers });
      notify("Detalle actualizado exitosamente");
      fetchDetails();
      if (refreshParent) {
        refreshParent();
      }
    } catch (error) {
      console.error("Error updating detail:", error);
      notify("Error al actualizar el detalle.");
    }
    setEditingDetailId(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingDetailId(null);
  };

  // Definición de columnas y preparación de datos para la tabla
  const columnsDetails = [
    { headerName: "Ubicación Detalle", field: "scantilon_location" },
    { headerName: "Nombre Detalle", field: "name_detail" },
    { headerName: "Material", field: "material" },
    { headerName: "Espesor capa (cm)", field: "layer_thickness" },
    { headerName: "Acción", field: "accion" },
  ];

  const data = details.map((det: Detail) => {
    const idDetail = det.id_detail ?? det.id;
    const isEditing = editingDetailId === idDetail;
    const textStyle =
      det.created_status === "created" || det.created_status === "global"
        ? { color: "var(--primary-color)", fontWeight: "bold" }
        : {};
    return {
      scantilon_location: <span style={textStyle}>{det.scantilon_location}</span>,
      name_detail: <span style={textStyle}>{det.name_detail}</span>,
      material: isEditing ? (
        <select
          className="form-control"
          value={editingDetailData.material_id}
          onChange={(e) =>
            setEditingDetailData((prev) => ({
              ...prev,
              material_id: Number(e.target.value),
            }))
          }
          onClick={fetchMaterials}
        >
          <option value={0}>Seleccione un material</option>
          {materials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.name}
            </option>
          ))}
        </select>
      ) : (
        <span style={textStyle}>
          {det.material && det.material !== "0" && det.material.toUpperCase() !== "N/A"
            ? det.material
            : "-"}
        </span>
      ),
      layer_thickness: isEditing ? (
        <input
          type="number"
          className="form-control"
          min="0"
          step="any"
          value={editingDetailData.layer_thickness}
          onKeyDown={(e) => {
            if (e.key === "-") e.preventDefault();
          }}
          onChange={(e) =>
            setEditingDetailData((prev) => ({
              ...prev,
              layer_thickness: Number(e.target.value),
            }))
          }
        />
      ) : (
        <span style={textStyle}>
          {det.layer_thickness && det.layer_thickness > 0 ? det.layer_thickness : "-"}
        </span>
      ),
      accion: isEditing ? (
        <ActionButtonsConfirm
          onAccept={() => handleConfirmInlineEdit(det)}
          onCancel={handleCancelInlineEdit}
        />
      ) : (
        <>
          <CustomButton
            className="btn-table"
            variant="editIcon"
            onClick={() => handleInlineEdit(det)}
          >
            Editar
          </CustomButton>
          {/* Se reemplaza la eliminación manual por el componente DeleteDetailButton */}
          <DeleteDetailButton
            detailId={idDetail!}
            onDelete={() => {
              fetchDetails();
              if (refreshParent) {
                refreshParent();
              }
            }}
          />
        </>
      ),
    };
  });

  return (
    <ModalCreate
      isOpen={isOpen}
      title={`Detalles ${selectedItem?.name_detail || ""}`}
      onSave={() => {}}
      onClose={onClose}
      modalStyle={{ maxWidth: "70%", width: "70%", padding: "32px" }}
      showSaveButton={false}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <CustomButton variant="save" onClick={handleNewDetail}>
          + Nuevo
        </CustomButton>
      </div>
      <TablesParameters columns={columnsDetails} data={data} />
    </ModalCreate>
  );
};

export default DetailModal;
