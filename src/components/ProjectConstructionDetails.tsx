import "../public/assets/css/globals.css";
import "../public/assets/css/button-builder.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

interface ConstructionDetail {
  location: string;
  name: string;
  layers: string;
  thickness: number;
}

const ProjectConstructionDetails = () => {
  const [constructionDetails, setConstructionDetails] = useState<ConstructionDetail[]>([]);
  const router = useRouter();

  const fetchConstructionDetails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/construction-details');
      setConstructionDetails(response.data);
    } catch (error) {
      console.error("Error fetching construction details", error);
    }
  };

  useEffect(() => {
    fetchConstructionDetails();
  }, []);

  return (
    <div className="construction-details-container d-flex justify-content-center align-items-center" 
      style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover", fontFamily: "Poppins, sans-serif" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "900px" }}>
        <h5 className="text-start text-custom-blue fw-bold">Detalles Constructivos</h5>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Ubicación Detalle</th>
              <th>Nombre Detalle</th>
              <th>Capas de Interior a Exterior</th>
              <th>Espesor Capa (cm)</th>
            </tr>
          </thead>
          <tbody>
            {constructionDetails.map((detail, index) => (
              <tr key={index}>
                <td>{detail.location}</td>
                <td>{detail.name}</td>
                <td>{detail.layers}</td>
                <td>{detail.thickness}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-custom-blue mt-3" onClick={() => router.push('/next-step')}>Siguiente</button>
      </div>
    </div>
  );
};

export default ProjectConstructionDetails;
import { useEffect } from "react";

