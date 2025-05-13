"use client";
import { useWallBuilder } from '@/hooks/ifc/useWallBuilder';
import { useApi } from '@/hooks/useApi';
import { getPropValue } from '@/lib/utils';
import { notify } from '@/utils/notify';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { Check, Loader2 } from "lucide-react"; // Import Lucide check icon
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Card from "../common/Card";
import CustomButton from "../common/CustomButton";
import IFCUploader from "./IfcUploader";

const loadIFCViewer = async () => {
  const { default: IFCViewer } = await import("@bytestone/ifc-component");
  return IFCViewer;
};

export default function IFCViewerComponent() {
  const [viewerInstance, setViewerInstance] = useState<any>(null);
  const [objectsData, setObjectsData] = useState<Array<{
    id: string;
    metadata: any;
    name: string;
    parent: string;
    props: Array<object>;
    type: string;
  }>>([]);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // New state for button disable
  const [fileSelected, setFileSelected] = useState<boolean>(false); // New state for file selection
  const api = useApi();
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event;
    if (file) {
      setFileSelected(true); // Enable the "Procesar Objetos" button
      loadIFCViewer().then((IFCViewer) => {
        viewerInstance?.unloadModel();
        setViewerInstance(
          new IFCViewer({ canvasId: "myCanvas", modelPath: "./output.ifc.xkt" })
        );
      });
    }
  }; // Add this closing brace

  const handleProcessFile = () => {
    if (viewerInstance) {
      viewerInstance.unloadAllModels?.();
      setViewerInstance(null);
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      setTimeout(() => {
        loadIFCViewer().then((IFCViewer) => {
          const newViewer = new IFCViewer({
            canvasId: "myCanvas",
            modelPath: "./output.ifc.xkt",
          });
          setViewerInstance(newViewer);
        });
      }, 100);
    }
  };

  const [projectId, setProjectId] = useState<string>('');


  useEffect(() => {
    if (router.query.id) {
      console.log("Project ID from router:", router.query.id);
      setProjectId(router.query.id as string);
    }
  }, [router.query.id]);

  useEffect(() => {
    loadIFCViewer()
      .then((IFCViewer) => {
        try {
          setViewerInstance(
            new IFCViewer({ canvasId: "myCanvas", modelPath: "" })
          );
        } catch (error) {
          console.error("Error initializing IFCViewer:", error);
        }
      })
      .catch((error) => {
        console.error("Error loading IFCViewer module:", error);
      });
  }, []);

  useEffect(() => {
    if (viewerInstance) {
      viewerInstance?.sceneModel?.on("loaded", async () => {
        setObjectsData(await viewerInstance?.objects);
      })
    }
  }, [viewerInstance])

  const wallBuilder = useWallBuilder(projectId);
  function parseNivel(nivel: string): number {
    const match = nivel?.match(/\d+$/); // Busca el número al final del string
    return match ? parseInt(match[0], 10) : 0; // Devuelve el número o 0 si no se encuentra
  }

  async function handleObjectCreation(obj: { name: any; enclosure_id?: any; project_id?: any; props: any; type: string }, globalObjects: any) {
    let endpoint;
    console.log("Object type:", obj.type, obj.type.includes("IfcSpace"));
    if (obj.type.includes('IfcWallStandardCase') || obj.type.includes('IfcDoor')) {
      if (!obj.project_id) {
        console.error('Project must be created before creating enclosures or related entities.');
        return;
      }
      if (!obj.enclosure_id) {
        console.error('Enclosure must be created before creating related entities.');
        return;
      }
      endpoint = obj.type.includes('IfcWallStandardCase')
        ? `/wall-enclosures-create/${obj.enclosure_id}`
        : `/door-enclosures-create/${obj.enclosure_id}`;
      setStatus(obj.type.includes('IfcWallStandardCase') ? "Creando muros..." : "Creando puertas...");
    } else if (obj.type.includes('IfcSpace')) {
      setStatus("Creando recintos...");
      endpoint = `/enclosure-generals-create/${projectId}`;
      try {
        // Get and validate level information
        const nivel = getPropValue(obj, 'Nivel');
        const piso = parseNivel(nivel);
        console.log("Processing floor level:", piso);

        // Get and validate enclosure code
        const codigoRecinto = obj.props.find((p: any) => p.name === 'CÓDIGO DE RECINTO')?.value;
        if (!codigoRecinto) {
          setStatus(`No se encontró el código de recinto para ${obj.name}`);
          return;
        }

        // Fetch occupation data
        const occupation = await fetchEnclosureByCode(codigoRecinto);
        if (!occupation) {
          setStatus(`No se encontró información para el código ${codigoRecinto}`);
          return;
        }

        // Get volume information
        const volume = obj.props.find((p: any) => p.name === 'Volumen')?.value || 0;

        // Create enclosure
        const response = await api.post(endpoint, {
          name_enclosure: occupation?.name || 'Default Enclosure',
          occupation_profile_id: occupation?.id,
          height: volume,
          co2_sensor: 'Default Sensor',
          level_id: piso
        });
        await wallBuilder.createFromEnclosure(response.id, obj, globalObjects)

        obj.enclosure_id = response.id;
        setStatus("Recinto creado exitosamente");

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido creando recinto';
        console.error('Error en la creación del recinto:', errorMessage);
        const errorDetail = axios.isAxiosError(error) ? error.response?.data?.detail : errorMessage;
        setStatus(`Error ${errorDetail}`);
      }
    } else {
      console.error('Unknown object type');
      return;
    }

    try {
      switch (endpoint) {
        case `/wall-enclosures-create/${obj.enclosure_id}`:
          await axios.post(endpoint, {
            wall_id: obj.props.find((p: any) => p.name === 'CÓDIGO MULTICAPA')?.value || 0,
            characteristics: obj.props.find((p: any) => p.name === 'Tipo')?.value || 'Default Characteristics',
            angulo_azimut: obj.props.find((p: any) => p.name === 'ORIENTACIÓN')?.value || '0',
            area: obj.props.find((p: any) => p.name === 'Área')?.value || 0
          });
          break;
        case `/door-enclosures-create/${obj.enclosure_id}`:
          await axios.post(endpoint, {
            door_id: obj.props.find((p: any) => p.name === 'MURO ASIGNADO')?.value || 0,
            characteristics: obj.props.find((p: any) => p.name === 'TIPO')?.value || 'Default Characteristics',
            angulo_azimut: obj.props.find((p: any) => p.name === 'ORIENTACIÓN')?.value || '0',
            area: obj.props.find((p: any) => p.name === 'Área')?.value || 0
          });
          break;
      }
      console.log(`Successfully processed: ${obj.name}`);
    } catch (error) {
      const errorMessage = `Error creando ${obj.name === 'IfcWallStandardCase' ? 'muro' : obj.name === 'IfcDoor' ? 'puerta' : obj.name === 'IfcSpace' ? 'recinto' : 'entidad'}`;
      console.error(errorMessage, error);
      setStatus(errorMessage);
    } finally {
      setStatus("Proceso completado"); // Clear status after completion
    }
  }

  function processObjectsSequentially(objects: Array<any>) {
    setIsProcessing(true); // Disable the button
    setStatus("Procesando objetos...");

    Promise.all(
      objects.map((obj) =>
        handleObjectCreation(obj, objects).catch((error) => {
          console.error(`Error processing ${obj.name}:`, error);
          setStatus("Error durante el procesamiento");
        })
      )
    )
      .then(() => {
        setStatus("Proceso completado");
        notify("Información extraída correctamente"); // Show notification once
        setTimeout(() => {
          router.push(`/workflow-part1-edit?id=${projectId}`); // Redirect after 1 second
        }, 1000);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  /**
   * Fetches enclosure details by code.
   * @param code - The code of the enclosure.
   * @returns A promise resolving to the enclosure details.
   */
  async function fetchEnclosureByCode(code: string) {
    try {
      const response = await api.get(`/enclosure-typing/by-code/${code}`);
      console.log("Enclosure details:", response.data);
      return response;
    } catch (error) {
      console.error("Error fetching enclosure by code:", error);
      throw error;
    }
  }

  return (
    <Card>
      <IFCUploader onFileUpload={handleFileUpload} />
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          {fileSelected && (
            <CustomButton
              onClick={() => processObjectsSequentially(objectsData)}
              disabled={isProcessing} // Disable button while processing
            >
              {isProcessing ? "Procesando..." : "Procesar Objetos"}
            </CustomButton>
          )}
        </Col>
      </Row>
      <Container fluid className="p-0">
        <Row className="g-0">
          <Col xs={12} md={6} style={{ height: "50vh", border: '1px solid #ccc', overflowY: 'auto' }}>
            <div id="treeViewContainer" style={{ height: "100%" }}></div>
          </Col>
          <Col xs={12} md={6} style={{ height: "50vh", border: '1px solid #ccc' }}>
            <div id="canvasContainer" style={{ height: "100%", width: "100%" }}>
              <canvas id="myCanvas" style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          </Col>
        </Row>
      </Container>
      {/* Status Indicator */}
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <h5 style={{ color: status === "Proceso completado" ? "green" : "black" }}>
              {isProcessing && <Loader2 size={20} className="me-2" />} {/* Show loader during processing */}
              {status === "Proceso completado" && <Check size={20} />} {status || "Esperando acción..."}
            </h5>
          </Col>
        </Row>
      </Container>
      {/* Tabla para mostrar objectsData */}
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <h5>Objetos IFC</h5>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Propiedades</th>
                  </tr>
                </thead>
                <tbody>
                  {objectsData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">Sin datos</td>
                    </tr>
                  ) : (
                    objectsData.map((obj) => (
                      <tr key={obj.id}>
                        <td>{obj.id}</td>
                        <td>{obj.name}</td>
                        <td>{obj.type}</td>
                        <td>{JSON.stringify(obj?.props)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </Container>
    </Card>
  );
}
