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
    const { post } = useApi();



    const createNodeMaster = async (
        name: string,
        interiorColor: string,
        exteriorColor: string
    ): Promise<CreateNodeMasterResponse> => {
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
            throw error;
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

    const createFromEnclosure = async (enclosureId: number, obj: any, globalObjects: any, keys = ['M_1', 'M_2', 'M_3', 'M_4']) => {

        const wallTypes = keys.map(key => {
            const wallValue = getPropValue(obj, key);
            return {
                key,
                value: wallValue
            };
        }).filter(wall => wall.value !== '');

        console.log('Wall Types:', wallTypes);
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
                for (const child of result) {
                    console.log('Processing child:', child); // Debugging log to inspect each child
                    const layerThickness = getPropValue(child.props, 'ESPESOR')
                    console.log('Layer Thickness:', layerThickness);
                    try {
                        await createNodeChild(
                            masterNode,
                            'Muro',
                            wall.value,
                            1, // TODO buscar el material correcto Default material ID 
                            1
                        );
                        console.log('Child node created successfully for:', child);
                    } catch (error) {
                        console.error('Error creating child node for:', child, error);
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
        createFromEnclosure
    };
};


