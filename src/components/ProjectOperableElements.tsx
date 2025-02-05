import "../public/assets/css/globals.css";
import "../public/assets/css/button-builder.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const ProjectOperableElements = () => {
  interface OperableElement {
    name: string;
    u_glass: number;
    fs_glass: number;
    closure_type: string;
    frame_type: string;
    u_frame: number;
    fm_percentage: number;
  }
  
  const [operableElements, setOperableElements] = useState<OperableElement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOperableElements = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/operable-elements');
        setOperableElements(response.data);
      } catch (error) {
        console.error("Error fetching operable elements", error);
      }
    };

    fetchOperableElements();
  }, []);

  return (
    <div className="operable-elements-container d-flex justify-content-center align-items-center" 
      style={{ height: "100vh", background: "url('/assets/images/background.jpg') no-repeat center center/cover", fontFamily: "Poppins, sans-serif" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "900px" }}>
        <h5 className="text-start text-custom-blue fw-bold">Elementos Operables</h5>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nombre Elemento</th>
              <th>U Vidrio [W/m2K]</th>
              <th>FS Vidrio []</th>
              <th>Tipo Cierre</th>
              <th>Tipo Marco</th>
              <th>U Marco [W/m2K]</th>
              <th>FM [%]</th>
            </tr>
          </thead>
          <tbody>
            {operableElements.map((element, index) => (
              <tr key={index}>
                <td>{element.name}</td>
                <td>{element.u_glass}</td>
                <td>{element.fs_glass}</td>
                <td>{element.closure_type}</td>
                <td>{element.frame_type}</td>
                <td>{element.u_frame}</td>
                <td>{element.fm_percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-custom-blue mt-3" onClick={() => router.push('/next-step')}>Siguiente</button>
      </div>
    </div>
  );
};

export default ProjectOperableElements;
