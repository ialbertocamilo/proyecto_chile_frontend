import { useApi } from '@/hooks/useApi';
import { constantUrlApiEndpoint } from '@/utils/constant-url-endpoint';
import { useState } from 'react';
import { useFloorBuilder } from './useFloorBuilder';
import { useWallBuilder } from './useWallBuilder';
import { getMaterialByCode, materialsCache } from './materialUtils';

import {
    Vector,
    Vectors,
    OccupationProfile,
    RoomProperties,
    Element,
    ConstructionGroup,
    ConstructionDetails,
    Room,
    BuildingStructure,
    RoomResponse,
    CreationStatus,
    FloorGroup,
    Window
} from '@/shared/interfaces/ifc.interface';
import { orientationToAzimutRange } from '@/utils/azimut';

export const useProjectIfcBuilder = (projectId: string) => {
    const { post, get, put } = useApi();
    const wallBuilder = useWallBuilder(projectId);
    const floorBuilder = useFloorBuilder(projectId);

    // Add a materials cache to avoid repeated API calls

    const [creationStatus, setCreationStatus] = useState<CreationStatus>({
        inProgress: false,
        completedRooms: 0,
        totalRooms: 0,
        progress: {
            rooms: 0,
            walls: 0,
            floors: 0,
            ceilings: 0,
            doors: 0,
            windows: 0
        },
        errors: []
    });
    const validateElementsExistence = async (details: ConstructionDetails) => {
        const missingElements: { type: string; name: string }[] = [];
        const checkExistence = async (type: string, elements: Element[]) => {
            if (!elements || elements.length === 0) return
            for (const element of elements) {
                if (type.toLowerCase() === 'door') {
                    const section = 'door';
                    const door = await wallBuilder.getElementByCodeIfc(section, element?.code as string);
                    if (!door || !door.id) {
                        missingElements.push({ type: 'door', name: element.name+ ', IFC Code: ' + element.code });
                    }
                    continue;
                }
                console.log(`Validating ${JSON.stringify(element)}: ${element.material}`);
                try {
                    if (element?.material && element?.material.toLowerCase() !== 'unknown') {
                        const materialInfo = await getMaterialByCode(element?.material);
                        if (!materialInfo) {
                            missingElements.push({ type, name: element.name+ ', IFC Code: ' + element?.material });
                        } 
                    }
                } catch (error) {
                    console.error(`Error validating material: ${element.material}`, error);
                    missingElements.push({ type, name: element.name+ ', IFC Code: ' + element?.material });
                }
            }
        };

        // Validate walls
        if (details.walls) {
            for (const wallGroup of details.walls) {
                await checkExistence('Wall', wallGroup.elements);
                console.log("Creando windows", wallGroup?.windows)
                if (wallGroup?.windows) {
                    for (const windowElement of wallGroup.windows) {
                        const materialInfo = await wallBuilder.getElementByCodeIfc('window', windowElement?.code);
                        console.log("materialInfo windows", materialInfo)
                        if (!materialInfo) {
                            missingElements.push({ type: 'window', name: windowElement.name+ ', IFC Code: ' + windowElement.code });
                        }
                    }
                }
            }
        }

        // Validate floors
        if (details.floors) {
            for (const floorGroup of details.floors) {
                await checkExistence('Floor', floorGroup?.elements);
            }
        }

        // Validate ceilings
        if (details.ceilings) {
            for (const ceilingGroup of details.ceilings) {
                await checkExistence('Ceiling', ceilingGroup?.elements);
            }
        }

        if(details.doors) {
            await checkExistence('Door', details.doors as unknown as Element[]);
        }

        return {
            missingElements,
            foundMaterials: Object.keys(materialsCache)
        };
    };

    const createProjectWithValidation = async (data: Room[]): Promise<any> => {
        const validationResults = [];

        console.log('buildingStructure data', data);
        for (const room of data) {
            const result = await validateElementsExistence(room.constructionDetails);
            const { missingElements, foundMaterials } = result;

            validationResults.push({
                roomName: room.name,
                foundMaterials
            });

            if (missingElements?.length > 0) {
                console.error('Missing elements:', missingElements);
                return {
                    success: false,
                    message: 'Some elements are missing. Creation process stopped.',
                    missingElements,
                    validationResults
                };
            }
        }
        const projectResult = await createProject(data);
        return {
            ...projectResult,
            validationResults
        };
    };
    /**
     * Parse level number from string (e.g., "00 NIVEL 01" => 1)
     */
    const parseNivel = (nivel: string): number => {
        const match = nivel?.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
    };

    /**
     * Fetch enclosure details by code
     */
    const fetchEnclosureByCode = async (code: string) => {
            const response = await get(`/enclosure-typing/by-code/${code}`);
            return response;
    };

    /**
     * Create a room (enclosure) in the project
     */
    const createRoom = async (room: Room): Promise<RoomResponse> => {
        try {
            // Get occupation data by room code
            const roomName = room.name;
            const occupation = await fetchEnclosureByCode(room.type);

            if (!occupation) {
                throw new Error(`No existe tipo de ocupación ${room.type} para ${roomName}`);
            }
            // Parse level
            const nivel = room.properties.level;
            const piso = parseNivel(nivel);

            // CHANGED: Use roomType instead of name for name_enclosure
            const response = await post(
                `/enclosure-generals-create/${projectId}`,
                {
                    name_enclosure: roomName || 'Default Enclosure',
                    occupation_profile_id: occupation?.id, // Default to ID 1 if not found
                    height: room.properties.averageHeight,
                    co2_sensor: 'No', // Default value
                    level_id: piso
                }
            );

            return {
                id: response.id,
                name: room.name,
                properties: Object.entries(room.properties).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: value
                }), {}),
                project_id: parseInt(projectId)
            };
        } catch (error: any) {
            const errorMessage = `${room.name}: ${error?.response?.data?.detail || error?.response?.data}`;
            throw new Error(errorMessage);
        }
    };

    /**
     * Update the creation status with detailed information
     */
    const updateStatus = (updates: Partial<CreationStatus>) => {
        setCreationStatus(prev => ({
            ...prev,
            ...updates,
        }));
    };

    /**
     * Create walls for a room using wall-enclosures-create endpoint
     */
    const createWalls = async (roomId: number, wallGroups: ConstructionGroup[]) => {
        const wallPromises: Promise<any>[] = [];
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'walls',
                currentComponent: 'Iniciando creación de muros'
            });

            for (const wallGroup of wallGroups) {
                try {
                    updateStatus({ currentComponent: `Creando grupo de muros: ${wallGroup.code}` });

                    // Create a master wall node first
                    const masterNodeName = wallGroup.code;
                    const masterNode = await wallBuilder.createNodeMaster(
                        masterNodeName,
                        'Claro',
                        'Claro',
                        {
                            ...wallGroup,
                            windows: (wallGroup as any).windows ?? []
                        },
                        roomId
                    );

                    // Create child nodes for each wall element in the group concurrently
                    const childPromises = wallGroup.elements.map(async (element) => {
                        try {
                            updateStatus({
                                currentComponent: `Creando capa para muro: ${element.name}`
                            });

                            // Get material ID from material code if available
                            let materialId = 1; // Default material ID
                            if (element.material && element.material.toLowerCase() !== 'unknown') {
                                    updateStatus({
                                        currentComponent: `Buscando material: ${element.material}`
                                    });
                                    const materialInfo = await getMaterialByCode(element.material);
                                    materialId = materialInfo?.id || 1;
                                    updateStatus({
                                        currentComponent: `Material encontrado: ${element.material} (ID: ${materialId})`
                                    });
                            }
                            const layerThickness = element.thickness; // Convert to cm
                            if (masterNode)
                                return wallBuilder.createNodeChild(
                                    masterNode,
                                    'Muro',
                                    element.name,
                                    materialId,
                                    layerThickness
                                );
                        } catch (error: any) {
                            errors.push({
                                message: ` ${error?.response?.data?.detail || 'Unknown error'}`,
                                context: `Wall group: ${wallGroup.code}, Element: ${element.name}`
                            });
                            return null;
                        }
                    });
                    await Promise.allSettled(childPromises);
                    const totalArea = Math.max(...wallGroup.elements.map(element => element.area || 0));
                    updateStatus({ currentComponent: `Asociando muro al recinto: ${wallGroup.code}` });

                    const orientation = wallGroup.elements[0]?.orientation || '';
                    const wallCharacteristics = "Exterior";
                    if (masterNode)
                        wallPromises.push(
                            post(`/wall-enclosures-create/${roomId}`, {
                                wall_id: masterNode.id,
                                characteristics: wallCharacteristics,
                                angulo_azimut: orientationToAzimutRange(orientation),
                                area: totalArea?.toFixed(2) || 0
                            }));
                    setCreationStatus(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            walls: prev.progress.walls + 1
                        }
                    }));
                } catch (error: any) {
                    errors.push({
                        message: `Error creating master wall node: ${error?.response?.data?.detail || 'Unknown error'}`,
                        context: `Wall group: ${wallGroup.code}`
                    });
                }
            }

            const results = await Promise.allSettled(wallPromises);

            results.forEach((result) => {
                if (result.status === 'rejected') {
                    errors.push({
                        message: `Error associating wall with room: ${result.reason?.message || 'Unknown error'}`,
                        context: `Wall association failed`
                    });
                }
            });

            updateStatus({ currentComponent: 'Creación de muros completada' });
            return { success: errors.length === 0, errors };
        } catch (error: any) {
            return {
                success: false,
                errors: [...errors, {
                    message: error.message || 'Unknown error when creating walls',
                    context: 'Creating walls'
                }]
            };
        }
    };    /**
     * Create floors for a room
     */
    const createFloors = async (roomId: number, floorDetailsMaster: FloorGroup[]) => {
        const floorPromises: Promise<any>[] = [];
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'floors',
                currentComponent: 'Iniciando creación de pisos'
            });

            // Fetch floor details from the API
            const floorDetails = await get(`/project/${projectId}/details/Piso`).catch(error => {
                throw new Error(`Error fetching floor details: ${error.message}`);
            });

            for (const floorGroup of floorDetailsMaster) {
                const masterNode = await floorBuilder.createNodeMaster(
                    floorGroup.code,
                    {
                        vertical: {
                            lambda: floorGroup.elements[0].aislVertLambda,
                            e_aisl: floorGroup.elements[0].aislVertE,
                            d: floorGroup.elements[0].aislVertD
                        },
                        horizontal: {
                            lambda: floorGroup.elements[0].aislHorizLambda,
                            e_aisl: floorGroup.elements[0].aislHorizE,
                            d: floorGroup.elements[0].aislHorizD
                        }
                    }
                );
                if (!masterNode) {
                    throw new Error(`Failed to create master floor node for: ${floorGroup.code}`);
                }
                for (const element of floorGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando piso: ${element.name}`
                        });
                        console.log("Element material", element.material)
                        console.log("Floor details", floorDetails)
                        const matchedFloor = floorDetails.find((floor: any) => floor.code_ifc === element.material);
                        console.log("Matched floor", matchedFloor)
                        if (!matchedFloor) {
                            try {
                                let materialId = 0;
                                if (element.material) {
                                    const materialInfo = await getMaterialByCode(element.material);
                                    console.log("Piso material info", materialInfo)
                                    materialId = materialInfo?.id
                                    updateStatus({
                                        currentComponent: `Material encontrado para piso: ${element.material} (ID: ${materialId})`
                                    });
                                }
                                const layerThickness = element.thickness || 20; // Default 20cm if not specified
                                await floorBuilder.createNodeChild(
                                    masterNode,
                                    'Piso',
                                    materialId,
                                    layerThickness
                                );

                            } catch (error: any) {
                                errors.push({
                                    message: `Error creating floor: ${error?.message || 'Unknown error'}`,
                                    context: `Floor group: ${floorGroup.code}, Element: ${element.name}`
                                });
                                continue;
                            }
                        }
                        setCreationStatus(prev => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                floors: prev.progress.floors + 1
                            }
                        }));
                    } catch (error: any) {
                        errors.push({
                            message: `Error creating floor element: ${error?.response?.data?.detail || 'Unknown error'}`,
                            context: `Floor group: ${floorGroup.code}, Element: ${element.name}`
                        });
                    }
                }
                const location = floorGroup.elements[0]?.location
    ? floorGroup.elements[0].location[0].toUpperCase() + floorGroup.elements[0].location.slice(1).toLowerCase()
    : 'Exterior';
                floorPromises.push(
                    post(`/floor-enclosures-create/${roomId}`, {
                        floor_id: masterNode.id,
                        characteristic: location,
                        area: floorGroup.elements[0]?.area || 0,
                        value_u: masterNode.value_u,
                        is_ventilated: floorGroup.elements[0]?.ventilated ? 'Ventilado' : 'No ventilado',
                        calculations: masterNode.calculations || {},
                        parameter: floorGroup.elements[0]?.perimeter || 0,
                    })
                );
            }

            const results = await Promise.allSettled(floorPromises);

            results.forEach((result) => {
                if (result.status === 'rejected') {
                    errors.push({
                        message: `Error completing floor creation: ${result.reason?.message || 'Unknown error'}`,
                        context: `Floor creation failed`
                    });
                }
            });

            setCreationStatus(prev => ({
                ...prev,
                progress: {
                    ...prev.progress,
                    floors: prev.progress.floors + 1
                }
            }));
            updateStatus({ currentComponent: 'Creación de pisos completada' });
            return { success: errors.length === 0, errors };
        } catch (error: any) {
            return {
                success: false,
                errors: [...errors, {
                    message: error?.response?.data?.detail || 'Unknown error when creating floors',
                    context: 'Creating floors'
                }]
            };
        }
    };

    /**
     * Create ceilings for a room
     */
    const createCeilings = async (roomId: number, ceilingGroups: ConstructionGroup[]) => {
        const ceilingPromises: Promise<any>[] = [];
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'ceilings',
                currentComponent: 'Iniciando creación de techos'
            });

            for (const ceilingGroup of ceilingGroups) {

                const ceilingResponse = await post(
                    `/user/Techo/detail-part-create?project_id=${projectId}`,
                    {
                        name_detail: `TECHO ${ceilingGroup.code}`,
                        scantilon_location: 'Techo'
                    }
                );
                for (const element of ceilingGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando techo: ${element.name}`
                        });
                        console.log('Ceiling element:', element);
                        // Handle missing material - try to fetch if not in cache
                        let materialId = 0; // Default material ID
                        if (element.material && element.material.toLowerCase() !== 'unknown') {
                            if (!materialsCache[element.material]?.id) {
                                try {
                                    // Use fetch as requested
                                    const token = localStorage.getItem('token');
                                    const code = element.material;
                                    const response = await fetch(
                                        `${constantUrlApiEndpoint}/constants-code_ifc?code_ifc=${code}`,
                                        {
                                            method: "GET",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );
                                    const materialInfo = await response.json();
                                    if (materialInfo?.id) {
                                        materialsCache[element.material] = materialInfo;
                                        materialId = materialInfo.id;
                                        updateStatus({
                                            currentComponent: `Material encontrado para techo: ${element.material} (ID: ${materialId})`
                                        });
                                    }
                                } catch (error) {
                                    updateStatus({
                                        currentComponent: `Error al buscar material de techo: ${element.material}`
                                    });
                                    console.warn(`Material not found for ceiling code: ${element.material}, using default ID 113`, error);
                                    errors.push({
                                        message: `Material de techo no encontrado: ${element.material}`,
                                        context: `Ceiling element: ${element.name}`
                                    });
                                }
                            } else {
                                materialId = materialsCache[element.material].id;
                            }
                        }

                        // Then create the layer for this ceiling
                        if (ceilingResponse)
                            await post(
                                `/user/detail-create/${ceilingResponse.id}`,
                                {
                                    layer_thickness: element.thickness ,
                                    material_id: materialId,
                                    name_detail: element.name,
                                    scantilon_location: 'Techo'
                                }
                            );


                        setCreationStatus(prev => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                ceilings: prev.progress.ceilings + 1
                            }
                        }));
                    } catch (error: any) {
                        errors.push({
                            message: `Error creating ceiling: ${error?.response?.data?.detail || 'Unknown error'}`,
                            context: `Ceiling: ${element.name}`
                        });
                    }
                }

                ceilingPromises.push(post(`/roof-enclosures-create/${roomId}`, {
                    roof_id: ceilingResponse.id,
                    characteristic: 'Exterior', // Default value
                    area: ceilingGroup.elements[0].area || 0
                }));
            }

            await Promise.allSettled(ceilingPromises);
            updateStatus({ currentComponent: 'Creación de techos completada' });
            return { success: errors.length === 0, errors };
        } catch (error: any) {
            return { success: false, errors: [{ message: error?.message || 'Unknown error' }] };
        }
    };

    /**
     * Create doors for a room
     */
    // Crear puertas validando existencia por code_ifc
    const createDoors = async (roomId: number, doors: any[]) => {
        const doorPromises: Promise<any>[] = [];
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'doors',
                currentComponent: 'Iniciando creación de puertas'
            });

            console.log("Creating doors :", doors);
            for (const door of doors) {
                const section = 'door';
                let element;
                try {
                    element = await wallBuilder.getElementByCodeIfc(section, door.code);
                } catch (e) {
                    errors.push({
                        message: `Error consultando existencia de puerta codigo ifc=${door.code}`,
                        context: `Puerta ${door.name}`
                    });
                    continue;
                }
                if (!element || !element.id) {
                    errors.push({
                        message: `No existe puerta con codigo ifc=${door.code}`,
                        context: `Puerta ${door.name}`
                    });
                    continue;
                }
                try {
                    const payload = {
                        angulo_azimut: orientationToAzimutRange(door.orientation),
                        orientacion: 'Exterior',
                        door_id: element.id,
                        broad: door.width || 0,
                        high: door.height || 0,
                        characteristics: door.name || ''
                    };
                    doorPromises.push(
                        post(`/door-enclosures-create/${roomId}`, {
                            ...payload,
                            enclosure_id: roomId
                        })
                    );
                    setCreationStatus(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            doors: prev.progress.doors + 1
                        }
                    }));
                } catch (err: any) {
                    errors.push({
                        message: `Error creando puerta : ${err && err.message ? err.message : String(err)}`,
                        context: `Puerta ${door.name}`
                    });
                }
            }

            const _results = await Promise.allSettled(doorPromises);
            updateStatus({ currentComponent: 'Creación de puertas completada' });

            return { success: errors?.length === 0, errors };
        } catch (error: any) {
            return {
                success: false,
                errors: [...errors, {
                    message: error.message || 'Unknown error when creating doors',
                    context: 'Creating doors'
                }]
            };
        }
    };
    // durante la creación de muros en useWallBuilder.tsx -> createNodeMaster

    /**
     * Create room details (walls, floors, ceilings, doors, windows)
     */
    const createRoomDetails = async (roomId: number, details: ConstructionDetails, roomName: string) => {
        const errors = [];
        console.log("roomId: ", roomId)
        console.log("details: ", details)
        updateStatus({
            currentRoom: roomName,
            currentPhase: 'creating-room',
            currentComponent: `Iniciando creación de detalles para recinto: ${roomName}`
        });

        // Create walls
        if (details.walls && details.walls.length > 0) {
            const wallResult = await createWalls(roomId, details.walls);
            if (!wallResult?.success || wallResult?.errors.length > 0) {
                errors.push(...wallResult.errors);
            }
        }

        // Create floors
        if (details.floors && details.floors.length > 0) {
            const floorResult = await createFloors(roomId, details.floors);
            if (!floorResult.success || floorResult.errors.length > 0) {
                errors.push(...floorResult.errors);
            }
        }

        // Create ceilings
        if (details.ceilings && details.ceilings.length > 0) {
            const ceilingResult = await createCeilings(roomId, details.ceilings);
            if (!ceilingResult.success || ceilingResult.errors.length > 0) {
                errors.push(...ceilingResult.errors);
            }
        }

        // Create doors (if any)
        if (details.doors && details.doors.length > 0) {
            const doorResult = await createDoors(roomId, details.doors);
            if (!doorResult?.success || doorResult?.errors.length > 0) {
                errors.push(...doorResult.errors);
            }
        }

        updateStatus({
            currentComponent: `Detalles para recinto ${roomName} completados`,
            currentPhase: undefined
        });

        return { success: errors.length === 0, errors };
    };

    /**
     * Create a complete project from the building structure
     */
    const createProject = async (data: Room[]) => {
        const allErrors: { context: string; message: any; }[] = [];

        setCreationStatus({
            inProgress: true,
            completedRooms: 0,
            totalRooms: data.length,
            currentPhase: undefined,
            currentRoom: undefined,
            currentComponent: 'Iniciando creación del proyecto',
            progress: {
                rooms: 0,
                walls: 0,
                floors: 0,
                ceilings: 0,
                doors: 0,
                windows: 0
            },
            errors: []
        });

        try {
            for (let i = 0; i < data.length; i++) {
                const room = data[i];

                try {
                    updateStatus({
                        currentRoom: room.name,
                        currentPhase: 'creating-room',
                        currentComponent: `Creando recinto: ${room.name} (${i + 1}/${data.length})`
                    });

                    // Create the room
                    const createdRoom = await createRoom(room).catch(error => {
                        throw new Error(`Failed to create room: ${error.message}`);
                    });

                    // Update room progress
                    setCreationStatus(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            rooms: prev.progress.rooms + 1
                        }
                    }));

                    // Create room construction details
                    const detailsResult = await createRoomDetails(
                        createdRoom.id,
                        room.constructionDetails,
                        room.name
                    );

                    if (!detailsResult.success) {
                        detailsResult.errors.forEach(error =>
                            allErrors.push({
                                ...error,
                                context: `Room ${room.name}: ${error?.message || 'Unknown error'}`
                            })
                        );
                    }

                    // Update status for this room's completion
                    setCreationStatus(prev => ({
                        ...prev,
                        completedRooms: prev.completedRooms + 1
                    }));

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    allErrors.push({
                        message: errorMessage,
                        context: `Room: ${room.name}`
                    });

                    // Update status to include this room as completed (though with error)
                    setCreationStatus(prev => ({
                        ...prev,
                        completedRooms: prev.completedRooms + 1
                    }));
                }
            }

            // Update final creation status with all collected errors
            setCreationStatus(prev => ({
                ...prev,
                inProgress: false,
                currentRoom: undefined,
                currentPhase: undefined,
                currentComponent: 'Creación del proyecto completada',
                errors: allErrors
            }));

            return {
                success: allErrors.length === 0,
                completedRooms: data.length,
                totalRooms: data.length,
                errors: allErrors
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error creating project: ${errorMessage}`, error);

            const finalErrors = [...allErrors, {
                message: `Error creating project: ${errorMessage}`,
                context: 'Project creation'
            }];

            setCreationStatus(prev => ({
                ...prev,
                inProgress: false,
                currentRoom: undefined,
                currentPhase: undefined,
                currentComponent: 'Error en la creación del proyecto',
                errors: finalErrors
            }));

            return {
                success: false,
                completedRooms: creationStatus.completedRooms,
                totalRooms: data.length,
                errors: finalErrors
            };
        } finally {
            setCreationStatus(prev => ({
                ...prev,
                inProgress: false
            }));
        }
    };

    /**
     * Updates the status of the project
     * @param status The new status to set for the project
     * @returns A promise that resolves when the status has been updated
     */
    const updateProjectStatus = async (status: string): Promise<void> => {
        if (!projectId) {
            throw new Error("Project ID is required to update status");
        }

        try {
            await put(`/project/${projectId}/status`, { status });
        } catch (error) {
            console.error('Error updating project status:', error);
            throw error;
        }
    };

    return {
        createProject,
        creationStatus,
        parseNivel,
        fetchEnclosureByCode,
        updateProjectStatus,
        createProjectWithValidation,
        materialsCache
    };
}