'use client'
import { useApi } from '@/hooks/useApi';
import { findObjectsByTypeAndProperty, getPropValue } from '@/lib/utils';
import { angleToAzimutRangeString } from '@/utils/azimut';
import { constantUrlApiEndpoint } from '@/utils/constant-url-endpoint';
import { getMaterialByCode } from './materialUtils';

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

interface Element {
    id: string;
    name: string;
    material: string;
    dimensions?: {
        x: number;
        y: number;
        z: number;
    };
    orientation?: string;
}

interface ConstructionGroup {
    code: string;
    elements: Element[];
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

interface WindowError {
    message: string;
    context: string;
}

interface Window {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    azimut: string;
    assignedWall: string;
    dimensions: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    vectors: any;
}

interface WallGroup {
    code: string;
    elements: Element[];
    windows: Window[];
}

export const useWallBuilder = (projectId: string) => {
    const { post, get } = useApi();
    const createWindowsForWall = async (
        wallId: number,
        wallGroup: WallGroup,
        roomId: number
    ): Promise<WindowError[]> => {
        const errors: WindowError[] = [];
        if (!wallGroup?.windows?.length) return errors;

        for (const window of wallGroup.windows) {
            try {
                // Validar existencia por code_ifc
                const code_ifc = 'VENTANA_001'; // Aquí deberías obtener el code_ifc real de la ventana
                const section = 'window';

                const element = await getElementByCodeIfc(section, code_ifc);
                if (!element || !element.id) {
                    errors.push({
                        message: `No existe ventana con codigo ifc=${code_ifc}`,
                        context: `Ventana ${window.name}`
                    });
                    continue;
                }

                const payload = {
                    alojado_en: "",
                    angulo_azimut: "0° ≤ Az < 22,5°",
                    broad: window.width,
                    characteristics: "Interior climatizado",
                    high: window.height,
                    housed_in: wallId,
                    position: "Interior",
                    with_no_return: "Sin",
                    window_id: element.id
                };

                await post(`/window-enclosures-create/${roomId}`, {
                    ...payload,
                    enclosure_id: roomId
                });
            } catch (error) {
                errors.push({
                    message: `Error creating window: ${error}`,
                    context: `Window ${window.name}`
                });
            }
        }
        return errors;
    };


    const getNodeMaster = async (nameDetail: string, projectId: string) => {
        try {
            const response = await get(
                `/user/detail-part-by-name/${nameDetail}?project_id=${projectId}`
            );
            return response;
        } catch (error) {
            console.error("Error getting node master:", error);
            return null;
        }
    }
    const createNodeMaster = async (
        name: string,
        interiorColor: string,
        exteriorColor: string,
        wallGroup?: WallGroup,
        enclosureId?: number
    ): Promise<CreateNodeMasterResponse | undefined> => {
        try {
            let response
            const nodeMaster = await getNodeMaster(name, projectId);
            if (nodeMaster) {
               response =nodeMaster
            }else
             response = await post(
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

            const wallResponse = response as CreateNodeMasterResponse;

            // Si tenemos roomId y wallGroup con ventanas, las creamos
            if (wallGroup && enclosureId && wallResponse?.id && wallGroup.windows?.length > 0) {
                const windowErrors = await createWindowsForWall(
                    wallResponse.id,
                    wallGroup,
                    enclosureId
                );

                if (windowErrors.length > 0) {
                    console.error("Errors creating windows:", windowErrors);
                }
            }

            return wallResponse;
        } catch (error) {
            console.error("Error creating wall detail part:", error);
            return undefined;
        }
    };

    const createNodeChild = async (
        nodeMaster: CreateNodeMasterResponse,
        scantilonLocation: string = "Muro",
        name: string,
        materialId: number,
        layerThickness: number
    ) => {
        console.log('Creating child node with:', {
            scantilonLocation,
            name,
            materialId,
            layerThickness
        });
        try {
            return await post(
                `/user/detail-create/${nodeMaster.id}`,
                {
                    scantilon_location: scantilonLocation,
                    name_detail: name,
                    material_id: materialId,
                    layer_thickness: layerThickness
                }
            );
        } catch (error) {
            console.error("Error creating node child:", error);
            throw error;
        }
    };


const createFromEnclosure = async (
        enclosureId: number,
        obj: any,
        globalObjects: any,
        keys = ['M_1', 'M_2', 'M_3', 'M_4']
    ) => {
        const errors: any[] = [];
        const wallTypes = keys
            .map(key => ({
                key,
                value: getPropValue(obj, key)
            }))
            .filter(wall => wall.value !== '');

        console.log("Creating layers of walls:", wallTypes);
        for (const wall of wallTypes) {
            try {                // Buscar las ventanas asociadas a este muro en los objetos globales
                const wallWindows = globalObjects
                    .filter((obj: any) =>
                        obj.type.includes('IfcWindow') &&
                        obj.props.some((p: any) => p.name === 'MURO ASIGNADO' && p.value === wall.value)
                    )
                    .map((window: any) => ({
                        id: window.id,
                        name: window.name,
                        type: window.type,
                        width: window.dimensions?.x || getPropValue(window, 'ANCHO') || 0,
                        height: window.dimensions?.y || getPropValue(window, 'ALTURA') || 0,
                        assignedWall: getPropValue(window, 'MURO ASIGNADO') || 'Unknown',
                        uValue: getPropValue(window, 'U') || 0,
                        dimensions: window.dimensions || { x: 0, y: 0, z: 0 },
                        position: window.position || { x: 0, y: 0, z: 0 },
                        vectors: window.vectors || null
                    }));

                const wallGroup: WallGroup = {
                    code: wall.value,
                    elements: [], // Se llenará después con los elementos del muro
                    windows: wallWindows
                };

                const masterNode = await createNodeMaster(
                    wall.value,
                    'Claro',
                    'Claro',
                    wallGroup,
                    enclosureId,
                );

                if (!masterNode) continue;

                const result = findObjectsByTypeAndProperty(
                    globalObjects,
                    "IfcWallStandardCase",
                    "CÓDIGO MULTICAPA",
                    wall.value
                );

                for (const child of result) {
                    const layerThickness = getPropValue(child.props, 'ESPESOR') as unknown as number;
                    try {
                        const material = await getMaterialByCode(child.props['MATERIAL']);
                        await createNodeChild(
                            masterNode,
                            'Muro',
                            wall.value,
                            material?.id || 1,
                            layerThickness
                        );
                    } catch (error) {
                        errors.push({
                            wall: wall.value,
                            error
                        });
                    }
                }
            } catch (error) {
                console.error(`Error creating wall for ${wall.key}:`, error);
            }
        }
        return errors;
    };

    const getElementByCodeIfc = async (section: string, code_ifc: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${constantUrlApiEndpoint}/${section}/elements/by_code_ifc/${code_ifc}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching element by code_ifc:', error);
            return null;
        }
    };

    return {
        createNodeMaster,
        createNodeChild,
        createFromEnclosure,
        getMaterialByCode,
        getElementByCodeIfc,
    };
};