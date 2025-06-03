import axios from 'axios';
import { constantUrlApiEndpoint } from '../utils/constant-url-endpoint';

export interface EnclosureStatus {
    walls: number;
    windows: number;
    floors: number;
}

export interface FailedEnclosure {
    enclosure_id: number;
    walls: number;
    windows: number;
    floors: number;
    requirements: {
        walls: string;
        windows: string;
        floors: string;
    };
}

export interface AdditionalValidation {
    valid: boolean;
    info: string;
}

export interface ProjectValidationResponse {
    valid: boolean;
    enclosures: Record<string, EnclosureStatus>;
    failed_enclosures?: FailedEnclosure[];
    additional_validations: Record<string, AdditionalValidation>;
}

/**
 * Validates the requirements of a project to check if it's ready for calculations
 * 
 * @param projectId - ID of the project to validate
 * @param checkClimateFile - If true, also validates the existence of climate files
 * @returns The validation result with details
 */
export async function validateProject(
    projectId: number,
    checkClimateFile: boolean = true
): Promise<ProjectValidationResponse> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get<ProjectValidationResponse>(
            `${constantUrlApiEndpoint}/validate-requirements/${projectId}`,
            {
                params: {
                    check_climate_file: checkClimateFile
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.detail || 'Error al validar el proyecto');
        }
        throw new Error('Error al validar el proyecto');
    }
}
