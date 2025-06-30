import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { constantUrlApiEndpoint } from '../../../src/utils/constant-url-endpoint';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  const token = req.headers.authorization || req.headers.Authorization || `Bearer ${req.cookies.token || ''}`;
  if (!id) {
    return res.status(400).json({ error: 'Missing project id' });
  }
  try {
    let url = `${constantUrlApiEndpoint}/calculate_v2/${id}`;
    // Si viene force_data, agregarlo como query param
    if (req.query.force_data) {
      const forceParam = encodeURIComponent(req.query.force_data as string);
      url += `?force_data=${forceParam}`;
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: token,
        accept: 'application/json',
      },
    });
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('[API] Error in calculate_v2:', error?.message || error);
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data?.detail || 'Error en calculate_v2',
        details: error.response?.data,
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
