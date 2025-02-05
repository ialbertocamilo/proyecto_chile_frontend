import "../public/assets/css/globals.css";
import "../public/assets/css/button-builder.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const ProjectMaterials = () => {
  interface Material {
    name: string;
    conductivity: number;
    specific_heat: number;
    density: number;
  }

  const [materials, setMaterials] = useState<Material[]>([]);
  const router = useRouter();

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className="materials-container d-flex justify-content-center align-items-center" 
      style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover", fontFamily: "Poppins, sans-serif" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "900px" }}>
        <h5 className="text-start text-custom-blue fw-bold">Definición de Materiales</h5>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nombre Material</th>
              <th>Conductividad (W/mk)</th>
              <th>Calor específico (J/kgk)</th>
              <th>Densidad (kg/m3)</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index}>
                <td>{material.name}</td>
                <td>{material.conductivity}</td>
                <td>{material.specific_heat}</td>
                <td>{material.density}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-custom-blue mt-3" onClick={() => router.push('/next-step')}>Siguiente</button>
      </div>
    </div>
  );
};

export default ProjectMaterials;
