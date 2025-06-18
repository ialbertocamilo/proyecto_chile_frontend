import { useApi } from "@/hooks/useApi";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";

interface FloorInfo {
    ref_aisl_vertical: {
        lambda: number;
        e_aisl: number;
        d: number;
    };
    ref_aisl_horizontal: {
        lambda: number;
        e_aisl: number;
        d: number;
    };
}

interface CreateNodeMasterFloorResponse {
    calculations: Record<string, unknown>;
    code_ifc: string;
    created_status: string;
    id: number;
    info: FloorInfo;
    name_detail: string;
    project_id: number;
    type: string;
    value_u: number;
}

export const useFloorBuilder = (projectId: string) => {
    const { post } = useApi();

    // Cache para almacenar resultados de getMaterialByCode
    const materialsCache: Record<string, any> = {};/**
     * Creates a master floor node
     * @param name The name of the floor
     * @param options Optional parameters for vertical and horizontal insulation
     * @param options.vertical Optional vertical insulation parameters
     * @param options.horizontal Optional horizontal insulation parameters
     */
    const createNodeMaster = async (
        name: string,
        options?: {
            vertical?: {
                lambda?: number;
                e_aisl?: number;
                d?: number;
            };
            horizontal?: {
                lambda?: number;
                e_aisl?: number;
                d?: number;
            };
        }
    ): Promise<CreateNodeMasterFloorResponse | undefined> => {
        try {            // Prepare request body with null values by default
            const requestBody: any = {
                name_detail: name,
                info: {
                    ref_aisl_vertical: {
                        lambda: 2,
                        e_aisl: 3,
                        d: 1
                    },
                    ref_aisl_horizontal: {
                        lambda: 2,
                        e_aisl: 3,
                        d: 1
                    }
                }
            };

            // Override with provided vertical insulation values if available
            if (options?.vertical) {
                if (options.vertical.lambda !== undefined) {
                    requestBody.info.ref_aisl_vertical.lambda = options.vertical.lambda;
                }
                if (options.vertical.e_aisl !== undefined) {
                    requestBody.info.ref_aisl_vertical.e_aisl = options.vertical.e_aisl;
                }
                if (options.vertical.d !== undefined) {
                    requestBody.info.ref_aisl_vertical.d = options.vertical.d;
                }
            }

            // Override with provided horizontal insulation values if available
            if (options?.horizontal) {
                if (options.horizontal.lambda !== undefined) {
                    requestBody.info.ref_aisl_horizontal.lambda = options.horizontal.lambda;
                }
                if (options.horizontal.e_aisl !== undefined) {
                    requestBody.info.ref_aisl_horizontal.e_aisl = options.horizontal.e_aisl;
                }
                if (options.horizontal.d !== undefined) {
                    requestBody.info.ref_aisl_horizontal.d = options.horizontal.d;
                }
            }

            const response = await post(
                `/user/Piso/detail-part-create?project_id=${projectId}`,
                requestBody
            );
            return response as CreateNodeMasterFloorResponse;
        } catch (error) {
            const errorMessage = "Error creating floor detail part";
            console.error(errorMessage, error);
            // throw error; //TODO verificar si es que es necesario retornar error
        }
    };    /**
     * Creates a child node for a floor
     */
    const createNodeChild = async (
        nodeMaster: CreateNodeMasterFloorResponse,
        scantilonLocation: string = "Piso",
        materialId: number,
        layerThickness: number // cm
    ) => {
        console.log('Creating floor child node with:', {
            scantilonLocation,
            masterId: nodeMaster.id,
            masterName: nodeMaster.name_detail,
            materialId,
            layerThickness
        });
        try {
            const response = await post(
                `/user/detail-create/${nodeMaster.id}`,
                {
                    scantilon_location: scantilonLocation,
                    name_detail: nodeMaster.name_detail,
                    material_id: materialId,
                    layer_thickness: layerThickness
                }
            );
            return response;
        } catch (error) {
            const errorMessage = "Error creating floor node child";
            console.error(errorMessage, error);
            throw error;
        }
    };    /**
     * Gets material information by code, using cache to avoid redundant API calls
     * @param code The material code to look up
     * @returns Material information or null if not found
     */
    const getMaterialByCode = async (code: string) => {
        // Check if we already have this material in cache
        if (materialsCache[code]) {
            console.log(`Using cached material for code: ${code}`);
            return materialsCache[code];
        }

        try {
            const token = localStorage.getItem("token");

            console.log(`Fetching material for code: ${code}`);
            const response = await fetch(`${constantUrlApiEndpoint}/constants-code_ifc?code_ifc=${code}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const materialInfo = data.length > 0 ? data[0] : null;

            // Store in cache if material was found
            if (materialInfo) {
                materialsCache[code] = materialInfo;
            }

            return materialInfo;
        } catch (error) {
            console.error("Error fetching material by code:", error);
            return null;
        }
    };

    return {
        createNodeMaster,
        createNodeChild,
        getMaterialByCode
    };
};
