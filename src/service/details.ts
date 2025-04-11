import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import { notify } from "@/utils/notify";
import axios from "axios";

export async function createDetail(detail_parent_id:string){
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${constantUrlApiEndpoint}/user/detail-create/${detail_parent_id}`,
        {
          scantilon_location: "Muro",
          name_detail: "Nuevo Detalle",
          material_id: 0,
          layer_thickness: 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data) {
        notify("Detalle creado exitosamente");
        return true
      }
    } catch (error) {
      console.error("Error al crear el detalle:", error);
      notify("No puedo crear el detalle");
      return false
    }
}