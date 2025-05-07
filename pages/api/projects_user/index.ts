import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { constantUrlApiEndpoint } from '../../../src/utils/constant-url-endpoint';

interface Project {
  id: number;
  status?: string;
  name_project?: string;
  owner_name?: string;
  designer_name?: string;
  director_name?: string;
  address?: string;
  country?: string;
  divisions?: {
    department?: string;
    province?: string;
    district?: string;
  };
  owner_lastname?: string;
  building_type?: string;
  main_use_type?: string;
  number_levels?: number;
  number_homes_per_level?: number;
  built_surface?: number;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProjectsResponse {
  projects: Project[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const baseUrl = constantUrlApiEndpoint?.includes('://localhost')
      ? constantUrlApiEndpoint.replace('://localhost', '://127.0.0.1')
      : constantUrlApiEndpoint;

    const url = `${baseUrl}/user/projects/`;
    console.log('[API] Attempting to connect to:', url);

    const response = await axios.get<ProjectsResponse>(
      url,
      {
        params: { limit: 999999, num_pag: 1 },
        headers: {
          Authorization: token,
        },
      }
    );

    console.log('[API] Projects fetched successfully');
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[API] Error fetching projects:', error);
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      };
      console.error('[API] Detailed Axios error:', JSON.stringify(errorDetails, null, 2));

      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.detail || 'Error fetching projects',
        details: errorDetails
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
