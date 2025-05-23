import { useApi } from '@/hooks/useApi';
import { useState } from 'react';
import { useWallBuilder } from './useWallBuilder';

// Type definitions for building structure
interface Vector {
    x: number;
    y: number;
    z: number;
}

interface Vectors {
    length: number;
    width: number;
    height: number;
    minPoint: number[];
    maxPoint: number[];
    center: number[];
}

interface OccupationProfile {
    code: string;
    type: string;
    occupation: string;
}

interface RoomProperties {
    roomCode: string;
    roomType: string;
    occupationProfile: OccupationProfile;
    level: string;
    volume: number;
    surfaceArea: number;
    averageHeight: number;
    wallsAverageHeight: number;
    dimensions: Vector;
    position: Vector;
}

interface Element {
    id: string;
    name: string;
    material: string;
    thickness: number;
    area?: number;
    volume?: number;
    color?: string;
    keyNote?: string;
    orientation?: string;
    location?: string;
    dimensions: Vector;
    position: Vector;
    vectors: Vectors;
}

interface ConstructionGroup {
    code: string;
    elements: Element[];
}

interface ConstructionDetails {
    walls: ConstructionGroup[];
    floors: ConstructionGroup[];
    ceilings: ConstructionGroup[];
    doors: ConstructionGroup[];
    windows: ConstructionGroup[];
}

interface Room {
    id: string;
    name: string;
    properties: RoomProperties;
    constructionDetails: ConstructionDetails;
}

interface BuildingStructure {
    buildingStructure: Room[];
}

interface RoomResponse {
    id: number;
    name: string;
    properties: Record<string, unknown>;
    project_id: number;
}

// Enhanced status tracking interface
interface CreationStatus {
    inProgress: boolean;
    completedRooms: number;
    totalRooms: number;
    currentRoom?: string;
    currentPhase?: 'walls' | 'floors' | 'ceilings' | 'doors' | 'windows' | 'creating-room';
    currentComponent?: string;
    progress: {
        rooms: number;
        walls: number;
        floors: number;
        ceilings: number;
        doors: number;
        windows: number;
    };
    errors: { message: string; context: string }[];
}

export const useProjectIfcBuilder = (projectId: string) => {
    const { post, get, put } = useApi();
    const wallBuilder = useWallBuilder(projectId);

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
            for (const element of elements) {
                console.log(`Validating ${JSON.stringify(element)}: ${element.material}`);
                try {
                    if (element?.material && element?.material.toLowerCase() !== 'unknown') {
                        // Check if material is already in cache
                        if (foundMaterials[element.material]) {
                            console.log(`Using cached material: ${element.material}`);
                            continue;
                        }

                        // If not in cache, fetch from API
                        const materialInfo = await wallBuilder.getMaterialByCode(element?.material);
                        if (!materialInfo) {
                            missingElements.push({ type, name: element.name });
                        } else {
                            // Add to found materials cache
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
                await checkExistence('Floor', floorGroup.elements);
            }
        }

        // Validate ceilings
        if (details.ceilings) {
            for (const ceilingGroup of details.ceilings) {
                await checkExistence('Ceiling', ceilingGroup.elements);
            }
        }

        // Validate doors
        if (details.doors) {
            for (const doorGroup of details.doors) {
                await checkExistence('Door', doorGroup.elements);
            }
        }

        // Validate windows
        if (details.windows) {
            for (const windowGroup of details.windows) {
                await checkExistence('Window', windowGroup.elements);
            }
        }

        // Update the materials cache with newly found materials
        setMaterialsCache(foundMaterials);

        return {
            missingElements,
            foundMaterials
        };
    };

    const createProjectWithValidation = async (data: BuildingStructure): Promise<any> => {
        const { buildingStructure } = data;
        const validationResults = [];

        for (const room of buildingStructure) {
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
            const roomCode = room.properties.roomCode;
            const occupation = await fetchEnclosureByCode(roomCode);

            // Parse level
            const nivel = room.properties.level;
            const piso = parseNivel(nivel);

            // CHANGED: Use roomType instead of name for name_enclosure
            const response = await post(
                `/enclosure-generals-create/${projectId}`,
                {
                    name_enclosure: room.properties.roomType || occupation?.name || 'Default Enclosure',
                    occupation_profile_id: occupation?.id || 1, // Default to ID 1 if not found
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
            console.error(errorMessage, error);
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
                        'Claro', // Default interior color
                        'Claro'  // Default exterior color
                    );

                    // Create child nodes for each wall element in the group concurrently
                    const childPromises = wallGroup.elements.map(async (element) => {
                        try {
                            updateStatus({
                                currentComponent: `Creando capa para muro: ${element.name}`
                            });

                            // Get material ID from material code if available
                            let materialId = 1; // Default material ID
                            if (element.material) {
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
                                        // Update cache with new material
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
                            if(masterNode)
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

                    // Calculate total area for the wall group (from the largest element)
                    const totalArea = Math.max(...wallGroup.elements.map(element => element.area || 0));

                    // Create only ONE wall association for the entire wall group
                    updateStatus({ currentComponent: `Asociando muro al recinto: ${wallGroup.code}` });

                    // Get orientation from the first element (assuming all elements in a group have the same orientation)
                    const orientation = wallGroup.elements[0]?.orientation || '';

                    // Set characteristics to one of the standard types, default to "Exterior"
                    // Possible values are "Exterior", "Inter Recintos Clim", or "Inter Recintos No Clim"
                    const wallCharacteristics = "Exterior";

                    // Create the wall in the room using the wall-enclosures-create endpoint
                    if (masterNode)
                    wallPromises.push(post(`/wall-enclosures-create/${roomId}`, {
                        wall_id: masterNode.id,
                        characteristics: wallCharacteristics,
                        angulo_azimut: formatAzimuth(orientation),
                        area: totalArea
                    }));

                    // Update wall progress count
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
    };

    /**
     * Create floors for a room
     */
    const createFloors = async (roomId: number, floorGroups: ConstructionGroup[]) => {
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

            for (const floorGroup of floorGroups) {
                for (const element of floorGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando piso: ${element.name}`
                        });

                        // Match the floor element with the fetched floor details
                        const matchedFloor = floorDetails.find((floor: any) => floor.code_ifc === 'PISO_001');

                        if (!matchedFloor) {
                            errors.push({
                                message: `No matching floor detail found for element: ${element.name}`,
                                context: `Floor group: ${floorGroup.code}`
                            });
                            continue;
                        }

                        // Use the matched floor details in the creation process
                        floorPromises.push(
                            post(`/floor-enclosures-create/${roomId}`, {
                                floor_id: matchedFloor.id,
                                characteristic: element.name,
                                area: element.area || 0,
                                value_u: matchedFloor.value_u,
                                calculations: matchedFloor.calculations || {}
                            })
                        );

                        // Update floor progress count
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
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'ceilings',
                currentComponent: 'Iniciando creación de techos'
            });

            for (const ceilingGroup of ceilingGroups) {
                for (const element of ceilingGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando techo: ${element.name}`
                        });

                        let materialId = 1; // Default material ID
                        if (element.material && element.material !== 'Unknown') {
                            try {
                                updateStatus({
                                    currentComponent: `Buscando material para techo: ${element.material}`
                                });

                                // First check if the material is in our cache
                                let materialInfo: any;
                                if (materialsCache[element.material]) {
                                    materialInfo = materialsCache[element.material];
                                    updateStatus({
                                        currentComponent: `Material para techo encontrado en cache: ${element.material} (ID: ${materialInfo?.id})`
                                    });
                                } else {
                                    materialInfo = await wallBuilder.getMaterialByCode(element.material);
                                    // Update cache with new material
                                    if (materialInfo) {
                                        setMaterialsCache(prev => ({
                                            ...prev,
                                            [element.material]: materialInfo
                                        }));
                                    }
                                }

                                materialId = materialInfo?.id || 1;
                                updateStatus({
                                    currentComponent: `Material para techo encontrado: ${element.material} (ID: ${materialId})`
                                });
                            } catch (error) {
                                updateStatus({
                                    currentComponent: `Error al buscar material para techo: ${element.material}`
                                });
                                console.warn(`Material not found for code: ${element.material}, using default ID 1`, error);
                                errors.push({
                                    message: `Material no encontrado para techo: ${element.material}, usando ID por defecto`,
                                    context: `Ceiling element: ${element.name}`
                                });
                            }
                        }

                        // No ceiling endpoint available yet - log instead of posting
                        console.info('Ceiling would be created with data:', {
                            ceiling_id: parseInt(String(ceilingGroup.code).replace(/[^0-9]/g, '')) || 0,
                            material_id: materialId,
                            area: element.area || 0,
                            thickness: element.thickness * 100 // Convert to cm
                        });

                        // Update ceiling progress count
                        setCreationStatus(prev => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                ceilings: prev.progress.ceilings + 1
                            }
                        }));
                    } catch (error: any) {
                        errors.push({
                            message: `Error creating ceiling element: ${error?.message || 'Unknown error'}`,
                            context: `Ceiling group: ${ceilingGroup.code}, Element: ${element.name}`
                        });
                    }
                }
            }

            updateStatus({ currentComponent: 'Creación de techos completada' });
            return { success: errors.length === 0, errors };
        } catch (error: any) {
            return {
                success: false,
                errors: [...errors, {
                    message: error?.message || 'Unknown error when creating ceilings',
                    context: 'Creating ceilings'
                }]
            };
        }
    };

    /**
     * Create doors for a room
     */
    const createDoors = async (roomId: number, doors: any[]) => {
        const doorPromises: Promise<any>[] = [];
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'doors',
                currentComponent: 'Iniciando creación de puertas'
            });

            for (const door of doors) {
                try {
                    updateStatus({
                        currentComponent: `Creando puerta: ${door.name}`
                    });

                    doorPromises.push(
                        post(`/door-enclosures-create/${roomId}`, {
                            door_id: door.assignedWall || 0,
                            characteristics: door.type || 'Default Characteristics',
                            angulo_azimut: formatAzimuth(door.orientation),
                            area: (door.width * door.height) || 0
                        })
                    );

                    // Update door progress count
                    setCreationStatus(prev => ({
                        ...prev,
                        progress: {
                            ...prev.progress,
                            doors: prev.progress.doors + 1
                        }
                    }));
                } catch (error: any) {
                    errors.push({
                        message: `Error creating door: ${error.message || 'Unknown error'}`,
                        context: `Door: ${door.name}`
                    });
                }
            }

            const _results = await Promise.allSettled(doorPromises);
            updateStatus({ currentComponent: 'Creación de puertas completada' });

            return { success: errors.length === 0, errors };
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

    /**
     * Create windows for a room
     */
    const createWindows = async (roomId: number, windowGroups: ConstructionGroup[]) => {
        const errors = [];

        try {
            updateStatus({
                currentPhase: 'windows',
                currentComponent: 'Iniciando creación de ventanas'
            });

            for (const windowGroup of windowGroups) {
                for (const element of windowGroup.elements) {
                    try {
                        updateStatus({
                            currentComponent: `Creando ventana: ${element.name}`
                        });

                        // No window endpoint available yet - log instead of posting
                        console.info('Window would be created with data:', {
                            window_id: parseInt(String(windowGroup.code).replace(/[^0-9]/g, '')) || 0,
                            characteristics: element.name || 'Default Window',
                            angulo_azimut: formatAzimuth(element.orientation),
                            area: element.area || 0
                        });

                        // Update window progress count
                        setCreationStatus(prev => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                windows: prev.progress.windows + 1
                            }
                        }));
                    } catch (error: any) {
                        errors.push({
                            message: `Error creating window element: ${error?.message || 'Unknown error'}`,
                            context: `Window group: ${windowGroup.code}, Element: ${element.name}`
                        });
                    }
                }
            }

            updateStatus({ currentComponent: 'Creación de ventanas completada' });
            return { success: errors.length === 0, errors };
        } catch (error: any) {
            return {
                success: false,
                errors: [...errors, {
                    message: error?.message || 'Unknown error when creating windows',
                    context: 'Creating windows'
                }]
            };
        }
    };

    /**
     * Create room details (walls, floors, ceilings, doors, windows)
     */
    const createRoomDetails = async (roomId: number, details: ConstructionDetails, roomName: string) => {
        const errors = [];

        updateStatus({
            currentRoom: roomName,
            currentPhase: 'creating-room',
            currentComponent: `Iniciando creación de detalles para recinto: ${roomName}`
        });

        // Create walls
        if (details.walls && details.walls.length > 0) {
            const wallResult = await createWalls(roomId, details.walls);
            if (!wallResult.success || wallResult.errors.length > 0) {
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
            if (!doorResult.success || doorResult.errors.length > 0) {
                errors.push(...doorResult.errors);
            }
        }

        // Create windows (if any)
        if (details.windows && details.windows.length > 0) {
            updateStatus({
                currentPhase: 'windows',
                currentComponent: 'Iniciando creación de ventanas'
            });

            const windowResult = await createWindows(roomId, details.windows);
            if (!windowResult.success || windowResult.errors.length > 0) {
                errors.push(...windowResult.errors);
            }

            updateStatus({ currentComponent: 'Creación de ventanas completada' });
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
    const createProject = async (data: BuildingStructure) => {
        const { buildingStructure } = data;
        const allErrors: { context: string; message: any; }[] = [];

        setCreationStatus({
            inProgress: true,
            completedRooms: 0,
            totalRooms: buildingStructure.length,
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
            // Process each room sequentially to provide clearer status updates
            for (let i = 0; i < buildingStructure.length; i++) {
                const room = buildingStructure[i];

                try {
                    updateStatus({
                        currentRoom: room.name,
                        currentPhase: 'creating-room',
                        currentComponent: `Creando recinto: ${room.name} (${i + 1}/${buildingStructure.length})`
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
                                context: `Room ${room.name}: ${error.context}`
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
                completedRooms: buildingStructure.length,
                totalRooms: buildingStructure.length,
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
                totalRooms: buildingStructure.length,
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
};