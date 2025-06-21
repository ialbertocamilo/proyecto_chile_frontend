// IFC-related interfaces for building structure and status tracking

export interface Vector {
    x: number;
    y: number;
    z: number;
}

export interface Vectors {
    length: number;
    width: number;
    height: number;
    minPoint: number[];
    maxPoint: number[];
    center: number[];
}

export interface OccupationProfile {
    code: string;
    type: string;
    occupation: string;
}

export interface RoomProperties {
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

export interface Element {
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

export interface ConstructionGroup {
    code: string;
    elements: Element[];
    windows: ConstructionGroup[];
}

export interface ConstructionDetails {
    walls: ConstructionGroup[];
    floors: ConstructionGroup[];
    ceilings: ConstructionGroup[];
    doors: ConstructionGroup[];
}

export interface Room {
    id: string;
    name: string;
    type: string;
    properties: RoomProperties;
    constructionDetails: ConstructionDetails;
}

export interface BuildingStructure {
    buildingStructure: Room[];
}

export interface RoomResponse {
    id: number;
    name: string;
    properties: Record<string, unknown>;
    project_id: number;
}

export interface CreationStatus {
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
