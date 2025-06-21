import { useApi } from '@/hooks/useApi';
import { constantUrlApiEndpoint } from '@/utils/constant-url-endpoint';
import { useState } from 'react';
import { useFloorBuilder } from './useFloorBuilder';
import { useWallBuilder } from './useWallBuilder';

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
  CreationStatus
} from '@/shared/interfaces/ifc.interface';

export const useProjectIfcBuilder = (projectId: string) => {
    const { post, get, put } = useApi();
    const wallBuilder = useWallBuilder(projectId);
    const floorBuilder = useFloorBuilder(projectId);

    // Add a materials cache to avoid repeated API calls
    const [materialsCache, setMaterialsCache] = useState<Record<string, any>>({});

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
        const foundMaterials: Record<string, any> = { ...materialsCache };

        // Helper function to check existence
        const checkExistence = async (type: string, elements: Element[]) => {
            if (!elements || elements.length === 0) return
            for (const element of elements) {
                if (type.toLowerCase() === 'door') {
                    // Validar existencia de puerta por code_ifc
                    const section = 'door';
                    const code_ifc = element.id;
                    const door = await wallBuilder.getElementByCodeIfc(section, code_ifc);
                    if (!door || !door.id) {
                        missingElements.push({ type: 'door', name: element.name });
                    }
                    continue;
                }
                console.log(`Validating ${JSON.stringify(element)}: ${element.material}`);
                try {
                    if (element?.material && element?.material.toLowerCase() !== 'unknown') {
                        // Check if material is already in cache
                        if (foundMaterials[element.material]) {
                            console.log(`Using cached material: ${element.material}`);
                            continue;
                        }

                        const materialInfo = await wallBuilder.getMaterialByCode(element?.material);
                        if (!materialInfo) {
                            missingElements.push({ type, name: element.name });
                        } else {
                            foundMaterials[element.material] = materialInfo;
                        }
                    }
                } catch (error) {
                    console.error(`Error validating material: ${element.material}`, error);
                    missingElements.push({ type, name: element.name });
                }
            }
        };

        // Validate walls
        if (details.walls) {
            for (const wallGroup of details.walls) {
                await checkExistence('Wall', wallGroup.elements);
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

        // Validate doors
        // if (details.doors) {
        //     for (const doorGroup of details.doors) {
        //         await checkExistence('Door', doorGroup);
        //     }
        // }

        // Update the materials cache with newly found materials
        setMaterialsCache(foundMaterials);

        return {
            missingElements,
            foundMaterials
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

        // Proceed with project creation if all elements exist
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
        try {
            const response = await get(`/enclosure-typing/by-code/${code}`);
            return response;
        } catch (error) {
            console.error(`Error fetching enclosure details for code ${code}:`, error);
            return null;
        }
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
            const errorMessage = `${room.name}: ${error?.response?.data?.detail || 'Unknown error'}`;
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
     * Converts a numeric angle to the required azimuth range format
     * @param angle Orientation angle in degrees
     * @returns Formatted azimuth range string (e.g. "0° ≤ Az < 22,5°")
     */
    const formatAzimuth = (angle: number | string | undefined): string => {
        if (angle === undefined) return "0° ≤ Az < 22,5°";

        // Convert to number if string
        let numericAngle = typeof angle === 'string' ? parseFloat(angle) : angle;

        // Normalize angle to [-180, 180) range
        numericAngle = numericAngle % 360;
        if (numericAngle >= 180) numericAngle -= 360;
        if (numericAngle < -180) numericAngle += 360;

        // Define the ranges (16 segments, each 22.5 degrees)
        const ranges: [number, number, string][] = [
            [-180, -157.5, "-180° ≤ Az < -157,5°"],
            [-157.5, -135, "-157,5° ≤ Az < -135°"],
            [-135, -112.5, "-135° ≤ Az < -112,5°"],
            [-112.5, -90, "-112,5° ≤ Az < -90°"],
            [-90, -67.5, "-90° ≤ Az < -67,5°"],
            [-67.5, -45, "-67,5° ≤ Az < -45°"],
            [-45, -22.5, "-45° ≤ Az < -22,5°"],
            [-22.5, 0, "-22,5° ≤ Az < 0°"],
            [0, 22.5, "0° ≤ Az < 22,5°"],
            [22.5, 45, "22,5° ≤ Az < 45°"],
            [45, 67.5, "45° ≤ Az < 67,5°"],
            [67.5, 90, "67,5° ≤ Az < 90°"],
            [90, 112.5, "90° ≤ Az < 112,5°"],
            [112.5, 135, "112,5° ≤ Az < 135°"],
            [135, 157.5, "135° ≤ Az < 157,5°"],
            [157.5, 180, "157,5° ≤ Az < 180°"]
        ];

        // Find matching range
        for (const [min, max, format] of ranges) {
            if (numericAngle >= min && numericAngle < max) {
                return format;
            }
        }

        // Default fallback
        return "0° ≤ Az < 22,5°";
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
                                try {
                                    updateStatus({
                                        currentComponent: `Buscando material: ${element.material}`
                                    });

                                    // First check if the material is in our cache
                                    let materialInfo: any;
                                    if (materialsCache[element.material]) {
                                        materialInfo = materialsCache[element.material];
                                        updateStatus({
                                            currentComponent: `Material encontrado en cache: ${element.material} (ID: ${materialInfo?.id})`
                                        });
                                    } else {
                                        materialInfo = await wallBuilder.getMaterialByCode(element.material);
                                        if (materialInfo) {
                                            setMaterialsCache(prev => ({
                                                ...prev,
                                                [element.material]: materialInfo
                                            }));
                                        }
                                    }

                                    materialId = materialInfo?.id || 1;
                                    updateStatus({
                                        currentComponent: `Material encontrado: ${element.material} (ID: ${materialId})`
                                    });
                                } catch (error) {
                                    updateStatus({
                                        currentComponent: `Error al buscar material: ${element.material}`
                                    });
                                    console.warn(`Material not found for code: ${element.material}, using default ID 1`, error);
                                    errors.push({
                                        message: `Material no encontrado: ${element.material}, usando ID por defecto`,
                                        context: `Wall element: ${element.name}`
                                    });
                                }
                            }

                            // Create wall layers
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

                    // Wait for all child nodes to be processed
                    await Promise.allSettled(childPromises);
                    const totalArea = Math.max(...wallGroup.elements.map(element => element.area || 0));
                    updateStatus({ currentComponent: `Asociando muro al recinto: ${wallGroup.code}` });

                    // Get orientation from the first element (assuming all elements in a group have the same orientation)
                    const orientation = wallGroup.elements[0]?.orientation || '';
                    const wallCharacteristics = "Exterior";
                    if (masterNode)
                        wallPromises.push(
                            post(`/wall-enclosures-create/${roomId}`, {
                                wall_id: masterNode.id,
                                characteristics: wallCharacteristics,
                                angulo_azimut: formatAzimuth(orientation),
                                area: totalArea
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

            // Wait for all wall associations to be created
            const results = await Promise.allSettled(wallPromises);

            // Collect errors from rejected promises
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
    const createFloors = async (roomId: number, floorDetailsMaster: ConstructionGroup[]) => {
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
                // Check if a matching floor exists first
                const masterNode = await floorBuilder.createNodeMaster(
                    floorGroup.code,
                );
                if (!masterNode) {
                    throw new Error(`Failed to create master floor node for: ${floorGroup.code}`);
                }
                for (const element of floorGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando piso: ${element.name}`
                        });

                        const matchedFloor = floorDetails.find((floor: any) => floor.code_ifc === element.material);
                        if (!matchedFloor) {
                            try {
                                let materialId = 1; // Default material ID
                                if (element.material && element.material.toLowerCase() !== 'unknown') {
                                    try {
                                        const materialInfo = await floorBuilder.getMaterialByCode(element.material);
                                        materialId = materialInfo?.id || 1; // Default to 1 if id is undefined
                                        updateStatus({
                                            currentComponent: `Material encontrado para piso: ${element.material} (ID: ${materialId})`
                                        });
                                    } catch (error) {
                                        // updateStatus({
                                        //     currentComponent: `Error al buscar material de piso: ${element.material}`
                                        // });
                                        console.warn(`Material not found for floor code: ${element.material}, using default ID 1`, error);
                                        // errors.push({
                                        //     message: `Material de piso no encontrado: ${element.material}, usando ID por defecto`,
                                        //     context: `Floor element: ${element.name}`
                                        // });
                                    }
                                }

                                // Create floor layer
                                const layerThickness = element.thickness || 20; // Default 20cm if not specified
                                // Create the floor layer
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
                // Use the newly created floor for room association
                floorPromises.push(
                    post(`/floor-enclosures-create/${roomId}`, {
                        floor_id: masterNode.id,
                        characteristic: 'Exterior', // TODO debe llegar el dato en ifc
                        area: floorGroup.elements[0]?.area || 0,
                        value_u: masterNode.value_u,
                        calculations: masterNode.calculations || {}
                    })
                );
            }

            const results = await Promise.allSettled(floorPromises);

            // Collect errors from rejected promises
            results.forEach((result) => {
                if (result.status === 'rejected') {
                    errors.push({
                        message: `Error completing floor creation: ${result.reason?.message || 'Unknown error'}`,
                        context: `Floor creation failed`
                    });
                }
            });

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
                                    layer_thickness: element.thickness || 35, // Default 35cm if not specified
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
                const code_ifc = 'PUERTA_001';
                const section = 'door';
                let element;
                try {
                    element = await wallBuilder.getElementByCodeIfc(section, code_ifc);
                } catch (e) {
                    errors.push({
                        message: `Error consultando existencia de puerta codigo ifc=${code_ifc}`,
                        context: `Puerta ${door.name}`
                    });
                    continue;
                }
                if (!element || !element.id) {
                    errors.push({
                        message: `No existe puerta con codigo ifc=${code_ifc}`,
                        context: `Puerta ${door.name}`
                    });
                    continue;
                }
                try {
                    const payload = {
                        angulo_azimut: formatAzimuth(door.orientation),
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