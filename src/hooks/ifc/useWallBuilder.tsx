import { useApi } from '@/hooks/useApi';
import { findObjectsByTypeAndProperty, getPropValue } from '@/lib/utils';
interface SurfaceColor {
    name: string;
    value: number;
}

interface WallInfo {
    surface_color: {
        interior: SurfaceColor;
        exterior: SurfaceColor;
    };
}

interface CreateNodeMasterResponse {
    calculations: Record<string, unknown>;
    code_ifc: string;
    created_status: string;
    id: number;
    info: WallInfo;
    name_detail: string;
    project_id: number;
    type: string;
    value_u: number;
}



export const useWallBuilder = (projectId: string) => {
    const { post, get } = useApi();



    const createNodeMaster = async (
        name: string,
        interiorColor: string,
        exteriorColor: string
    ): Promise<CreateNodeMasterResponse | undefined> => {
        try {
            const response = await post(
                `/user/Muro/detail-part-create?project_id=${projectId}`,
                {
                    name_detail: name,
                    info: {
                        surface_color: {
                            interior: { name: interiorColor },
                            exterior: { name: exteriorColor }
                        }
                    }
                }
            );
            return response as CreateNodeMasterResponse; // Return the typed response
        } catch (error) {
            const errorMessage = "Error creating wall detail part";
            console.error(errorMessage, error);
            // throw error; //TODO verificar si es que es necesario retornar error
        }
    };

    const createNodeChild = async (
        nodeMaster: CreateNodeMasterResponse,
        scantilonLocation: string = "Muro",
        name: string,
        materialId: number,
        layerThickness: number // cm
    ) => {

        console.log('Creating child node with:', {
            scantilonLocation,
            name,
            materialId,
            layerThickness
        });
        try {
            const response = await post(
                `/user/detail-create/${nodeMaster.id}`,
                {
                    scantilon_location: scantilonLocation,
                    name_detail: name,
                    material_id: materialId,
                    layer_thickness: layerThickness
                }
            );
            return response;
        } catch (error) {
            const errorMessage = "Error creating node child";
            console.error(errorMessage, error);
            throw error;
        }
    };

    const getMaterialByCode = async (code: string) => {
        const response = await get(`/constants-code_ifc?code_ifc=${code}`)

        return response
    }
    const createFromEnclosure = async (enclosureId: number, obj: any, globalObjects: any, keys = ['M_1', 'M_2', 'M_3', 'M_4']) => {

        const errors = []
        const wallTypes = keys.map(key => {
            const wallValue = getPropValue(obj, key);
            return {
                key,
                value: wallValue
            };
        }).filter(wall => wall.value !== '');


        console.log("Creating layers of walls:", wallTypes);
        for (const wall of wallTypes) {
            try {
                const masterNode = await createNodeMaster(
                    wall.value,
                    'Claro', // default interior color TODO buscar el color correcto
                    'Claro'   // default exterior color TODO buscar el color correcto
                );
                console.log('Master Node:', masterNode);
                const result = findObjectsByTypeAndProperty(globalObjects, "IfcWallStandardCase", "CÓDIGO MULTICAPA", wall.value);

                console.log('Creando nodo hijos:', result);
                // Creacion de muros
                for (const child of result) {
                    const layerThickness = getPropValue(child.props, 'ESPESOR') as unknown as number;
                    console.log('Layer Thickness:', layerThickness);
                    try {
                        const material = await getMaterialByCode(child.props['MATERIAL'])
                        await createNodeChild(
                            masterNode,
                            'Muro',
                            wall.value,
                            material?.id,
                            layerThickness
                        );
                        console.log('Child node created successfully for:', child);
                    } catch (error) {
                        errors.push({
                            wall: wall.value,
                            error: error
                        });
                    }
                }
            } catch (error) {
                console.error(`Error creating wall for ${wall.key}:`, error);
            }
        }
    }

    return {
        createNodeMaster,
        createNodeChild,
        createFromEnclosure,
        getMaterialByCode  // Expose this function for use in useProjectIfcBuilder
    };
};


