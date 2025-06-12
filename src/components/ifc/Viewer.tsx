"use client";
import { useProjectIfcBuilder } from '@/hooks/ifc/useProjectIfcBuilder';
import { getPropValue } from '@/lib/utils';
import { notify } from '@/utils/notify';
import "bootstrap/dist/css/bootstrap.min.css";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import Card from "../common/Card";
import CustomButton from "../common/CustomButton";
import IFCUploader from "./IfcUploader";
import { ErrorDetailsAccordion } from './components/ErrorDetailsAccordion';
import { MissingElementsPanel } from './components/MissingElementsPanel';
import { ProjectStatusPanel } from './components/ProjectStatusPanel';

/**
 * Dynamically loads the IFC viewer component
 */
const loadIFCViewer = async () => {
  const { default: IFCViewer } = await import("@bytestone/ifc-component");
  return IFCViewer;
};

/**
 * Main IFC viewer component
 */
export default function IFCViewerComponent() {
  // Component state
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [structuredOutput, setStructuredOutput] = useState<string>("");
  const [missingElements, setMissingElements] = useState<Array<{ type: string; name: string }>>([]);

  // Hooks
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const projectBuilder = useProjectIfcBuilder(projectId);

  // Event handlers and utility functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event;
    if (file) {
      setFileSelected(true);
      loadIFCViewer().then((IFCViewer) => {
        viewerInstance?.unloadModel();
        setViewerInstance(
          new IFCViewer({ canvasId: "myCanvas", modelPath: "./output.ifc.xkt" })
        );
      });
    }
  };
  // Generate the structured output from objects
  const generateStructuredOutput = (objects: Array<any>) => {
    // Find all IfcSpace objects (rooms)
    const rooms = objects.filter(obj => obj.type.includes('IfcSpace'));

    const structuredData = {
      buildingStructure: rooms.map(room => {
        const roomCode = getPropValue(room, 'CÓDIGO DE RECINTO') || 'Unknown';

        // Find all walls associated with this room
        const wallCodes: string[] = [];
        room.props.forEach((prop: any) => {
          if (prop.name && prop.name.startsWith('M_') && prop.value) {
            wallCodes.push(prop.value);
          }
        });

        // Get all walls associated with this room
        const roomWalls = objects.filter(obj =>
          obj.type.includes('IfcWall') &&
          (obj.props.some((p: any) => p.name === 'RECINTO ASIGNADO' && p.value === roomCode) ||
            wallCodes.some(code => obj.props.some((p: any) => p.name === 'CÓDIGO MULTICAPA' && p.value === code)))
        );

        // Calculate average height from walls (using y dimension)
        let averageWallHeight = 0;
        if (roomWalls.length > 0) {
          const totalHeight = roomWalls.reduce((sum, wall) => {
            // Use wall.dimensions.y as the height if available
            return sum + (wall.dimensions?.y || 0);
          }, 0);
          averageWallHeight = totalHeight / roomWalls.length;
        }

        // Find floor codes associated with this room
        const floorCodes: string[] = [];
        room.props.forEach((prop: any) => {
          if (prop.name === 'PISO RECINTO' && prop.value) {
            floorCodes.push(prop.value);
          }
        });

        // Find ceiling codes associated with this room
        const ceilingCodes: string[] = [];
        room.props.forEach((prop: any) => {
          if (prop.name === 'TECHO RECINTO' && prop.value) {
            ceilingCodes.push(prop.value);
          }
        });

        // Find doors associated with this room
        const doors = objects.filter(obj =>
          obj.type.includes('IfcDoor') &&
          obj.props.some((p: any) => p.name === 'RECINTO ASIGNADO' && p.value === roomCode)
        );

        // Find windows associated with this room
        const windows = objects.filter(obj =>
          obj.type.includes('IfcWindow') &&
          obj.props.some((p: any) => p.name === 'RECINTO ASIGNADO' && p.value === roomCode)
        );

        const roomType=getPropValue(room, 'TIPOLOGÍA DE RESINTO') || getPropValue(room, 'TIPOLOGÍA DE RECINTO') || getPropValue(room, 'TIPOLOGIA DE RECINTO')
        return {
          id: room.id,
          name: room.name,
          properties: {
            roomCode: roomCode,
            roomType,
            occupationProfile: {
              code: roomCode, // CÓDIGO DE RECINTO
              type: getPropValue(room, 'TIPOLOGÍA DE RESINTO') || 'Unknown', // TIPOLOGÍA DE RESINTO
              occupation: getPropValue(room, 'Ocupación') || 'Unknown'
            },
            level: getPropValue(room, 'Nivel') || 'Unknown',
            volume: room.volume || getPropValue(room, 'Volumen') || 0,
            surfaceArea: room.surfaceArea || 0,
            averageHeight: averageWallHeight > 0 ? averageWallHeight :
              (room.dimensions?.z ||
                (room.volume && room.surfaceArea ? room.volume / room.surfaceArea :
                  getPropValue(room, 'Altura') ||
                  (getPropValue(room, 'Volumen') && getPropValue(room, 'Área') ?
                    (Number(getPropValue(room, 'Volumen')) / Number(getPropValue(room, 'Área'))) :
                    'Unknown'))),
            wallsAverageHeight: averageWallHeight > 0 ? averageWallHeight : 0,
            dimensions: room.dimensions || {
              x: 0,
              y: 0,
              z: 0
            },
            position: room.position || {
              x: 0,
              y: 0,
              z: 0
            }
          },
          constructionDetails: {
            walls: wallCodes.map(code => {
              const walls = objects.filter(obj =>
                obj.type.includes('IfcWall') &&
                obj.props.some((p: any) => p.name === 'CÓDIGO MULTICAPA' && p.value === code)
              );

              return {
                code: code,
                elements: walls.map(wall => ({
                  id: wall.id,
                  name: wall.name,
                  area: wall.surfaceArea || getPropValue(wall, 'Área') || 0,
                  material: getPropValue(wall, 'MATERIAL') || 'Unknown',
                  thickness: wall.dimensions?.z || getPropValue(wall, 'ESPESOR') || 0,
                  orientation: getPropValue(wall, 'ORIENTACIÓN') || 0,
                  location: getPropValue(wall, 'UBICA_ELEMENTO') || 'Unknown',
                  volume: wall.volume || 0,
                  dimensions: wall.dimensions || { x: 0, y: 0, z: 0 },
                  position: wall.position || { x: 0, y: 0, z: 0 },
                  vectors: wall.vectors || null
                }))
              };
            }),
            floors: floorCodes.map(code => {
              const floors = objects.filter(obj =>
                obj.type.includes('IfcSlab') &&
                obj.props.some((p: any) => p.name === 'CÓDIGO MULTICAPA' && p.value === code)
              );

              return {
                code: code,
                elements: floors.map(floor => ({
                  id: floor.id,
                  name: floor.name,
                  material: getPropValue(floor, 'MATERIAL') || 'Unknown',
                  color: getPropValue(floor, 'COLOR') || 'Unknown',
                  thickness: floor.dimensions?.z || getPropValue(floor, 'ESPESOR') || 0,
                  keyNote: getPropValue(floor, 'Nota clave') || 'Unknown',
                  area: floor.surfaceArea || 0,
                  volume: floor.volume || 0,
                  dimensions: floor.dimensions || { x: 0, y: 0, z: 0 },
                  position: floor.position || { x: 0, y: 0, z: 0 },
                  vectors: floor.vectors || null
                }))
              };
            }),
            ceilings: ceilingCodes.map(code => {
              const ceilings = objects.filter(obj =>
                obj.type.includes('IfcSlab') &&
                obj.props.some((p: any) => p.name === 'CÓDIGO MULTICAPA' && p.value === code)
              );

              return {
                code: code,
                elements: ceilings.map(ceiling => ({
                  id: ceiling.id,
                  name: ceiling.name,
                  material: getPropValue(ceiling, 'MATERIAL') || 'Unknown',
                  color: getPropValue(ceiling, 'COLOR') || 'Unknown',
                  thickness: ceiling.dimensions?.z || getPropValue(ceiling, 'ESPESOR') || 0,
                  keyNote: getPropValue(ceiling, 'Nota clave') || 'Unknown',
                  area: ceiling.surfaceArea || 0,
                  volume: ceiling.volume || 0,
                  dimensions: ceiling.dimensions || { x: 0, y: 0, z: 0 },
                  position: ceiling.position || { x: 0, y: 0, z: 0 },
                  vectors: ceiling.vectors || null
                }))
              };
            }),
            doors: doors.map(door => ({
              id: door.id,
              name: door.name,
              type: getPropValue(door, 'TIPO') || 'Unknown',
              width: door.dimensions?.x || getPropValue(door, 'ANCHO') || 0,
              height: door.dimensions?.y || getPropValue(door, 'ALTURA') || 0,
              assignedWall: getPropValue(door, 'MURO ASIGNADO') || 'Unknown',
              uValue: getPropValue(door, 'U') || 0,
              dimensions: door.dimensions || { x: 0, y: 0, z: 0 },
              position: door.position || { x: 0, y: 0, z: 0 },
              vectors: door.vectors || null
            })),
            windows: windows.map(window => ({
              id: window.id,
              name: window.name,
              type: getPropValue(window, 'TIPO') || 'Unknown',
              width: window.dimensions?.x || getPropValue(window, 'ANCHO') || 0,
              height: window.dimensions?.y || getPropValue(window, 'ALTURA') || 0,
              assignedWall: getPropValue(window, 'MURO ASIGNADO') || 'Unknown',
              uValue: getPropValue(window, 'U') || 0,
              dimensions: window.dimensions || { x: 0, y: 0, z: 0 },
              position: window.position || { x: 0, y: 0, z: 0 },
              vectors: window.vectors || null
            }))
          }
        };
      })
    };

    // Return a prettified JSON string
    return JSON.stringify(structuredData, null, 2);
  };

  // Process all objects
  async function processObjectsSequentially(objects: Array<any>) {
    setIsProcessing(true);
    setStatus("Procesando objetos...");

    try {
      // Generate structured output
      const structuredText = generateStructuredOutput(objects);
      setStructuredOutput(structuredText);

      // Parse the structured text into a JSON object
      const buildingStructure = JSON.parse(structuredText);
      
      console.log("Building structure:", buildingStructure);
      // Use the projectBuilder hook to create the project from the structured data
      setStatus("Creando proyecto...");
      const result = await projectBuilder.createProjectWithValidation(buildingStructure);

      if (result?.success) {
        setStatus(`Proceso completado: ${result?.completedRooms} recintos creados`);
        notify("Proyecto creado exitosamente");

        // Update project status to "en proceso"
        try {
          setStatus("Actualizando estado del proyecto...");
          await projectBuilder.updateProjectStatus("en proceso");
          setStatus(`Proceso completado: ${result?.completedRooms} recintos creados. Proyecto en proceso.`);
          notify("Estado del proyecto actualizado a 'en proceso'");
        } catch (statusError) {
          console.error("Error al actualizar estado del proyecto:", statusError);
          notify("Proyecto creado pero no se pudo actualizar su estado", "warning");
        }
      }
      else {

        setStatus(`Proceso no logró completarse debido a errores.`);
        console.error("Errors during project creation:", result);
        notify(`Proceso no logró completarse debido a errores`, "error");
        setMissingElements(result.missingElements || []);
        setIsProcessing(false);  // Cerramos el panel de estado pero mostramos el botón para ver missing elements
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el procesamiento';
      console.error("Error processing objects:", error);
      setStatus(`Error: ${errorMessage}`);
      notify(`Error: ${errorMessage}`, "error");
      setIsProcessing(false);
    }
  }

  // Effects
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

    // Cleanup function to release memory when component unmounts
    return () => {
      if (viewerInstance) {
        console.log("Cleaning up IFC viewer resources...");
        // Unload any models
        viewerInstance.unloadModel?.();
        // Dispose of the viewer if it has a dispose method
        viewerInstance.dispose?.();
        // Clear the canvas
        const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        // Force garbage collection by nullifying the reference
        setViewerInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    if (viewerInstance) {
      viewerInstance?.sceneModel?.on("loaded", async () => {
        setObjectsData(await viewerInstance?.objects);
      })
    }
  }, [viewerInstance]);

  // Render component
  return (
    <Card>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestor IFC</h2>
        </Col>
      </Row>
      <IFCUploader onFileUpload={handleFileUpload} />
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          {fileSelected && (
            <CustomButton
              onClick={() => processObjectsSequentially(objectsData)}
              disabled={isProcessing}
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
            <h5 style={{
              color: status.includes("Error") || status.includes("errores") ? "red" :
                status === "Proceso completado" ? "green" :
                  "black"
            }}>
              {isProcessing && <Loader2 size={20} className="me-2" />}
              {status === "Proceso completado" && <Check size={20} />}
              {status || "Esperando acción..."}
            </h5>

            {/* Mostrar botón para ver elementos faltantes si hay alguno */}
            {missingElements.length > 0 && !isProcessing && (
              <CustomButton
                onClick={() => setIsProcessing(true)}
                className="btn-warning mt-2"
              >
                Ver {missingElements.length} Elementos Faltantes
              </CustomButton>
            )}
          </Col>
        </Row>

        {/* Detailed status section - Ahora se muestra siempre que haya un estado de creación */}
        {(isProcessing || projectBuilder.creationStatus.completedRooms > 0 || projectBuilder.creationStatus.errors.length > 0) && (
          <ProjectStatusPanel creationStatus={{
            ...projectBuilder.creationStatus,
            missingElements: missingElements
          }} />
        )}

        {/* Error Details Section */}
        {projectBuilder.creationStatus.errors.length > 0 && (
          <ErrorDetailsAccordion errors={projectBuilder.creationStatus.errors} />
        )}

        {/* Missing Elements Panel - Mostrar si hay elementos faltantes y el usuario ha hecho clic en el botón */}
        {missingElements.length > 0 && isProcessing && (
          <MissingElementsPanel
            elements={missingElements}
            onClose={() => setIsProcessing(false)}
          />
        )}
      </Container>

    </Card>
  );
}