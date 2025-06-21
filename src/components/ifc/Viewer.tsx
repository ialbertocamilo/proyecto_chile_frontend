"use client";
import { useProjectIfcBuilder } from '@/hooks/ifc/useProjectIfcBuilder';
import { IFC_PROP, IFC_TYPES } from '@/constants/ifc';
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
import { orientationToAzimutRange } from '@/utils/azimut';
import { Room, Room } from '@/shared/interfaces/ifc.interface';

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
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

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
  const generateStructuredOutput = (objects: Array<any>):Room[] => {
    // Find all IfcSpace objects (rooms)
    const rooms = objects.filter(obj => obj.type.includes(IFC_TYPES.IFCSpace));

    return  rooms.map(room => {
        const roomCode = getPropValue(room, IFC_PROP.ROOM_CODE);
        if (!roomCode)
          throw new Error(IFC_PROP.ROOM_CODE_ERROR);
        const roomEnclosureType = getPropValue(room, IFC_PROP.ROOM_TYPE);
        if (!roomEnclosureType)
          throw new Error(IFC_PROP.ROOM_TYPE_ERROR);

        // Find all walls associated with this room
        const wallCodes: string[] = [];
        room.props.forEach((prop: any) => {
          if (prop.name && prop.name.startsWith('M_') && prop.value) {
            wallCodes.push(prop.value);
          }
        });
        // Get all walls associated with this room
        const roomWalls = objects.filter(obj =>
          obj.type.includes(IFC_TYPES.IFCWall) &&
          (obj.props.some((p: any) => p.name === IFC_PROP.ASSIGNED_ROOM && p.value === roomCode) ||
            wallCodes.some(code => obj.props.some((p: any) => p.name === IFC_PROP.WALL_CODE && p.value === code)))
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
          if ((prop.name === IFC_PROP.FLOOR_ROOM && prop.value)) {
            floorCodes.push(prop.value);
          }
        });

        const roomFloors =  objects.filter(obj =>
          obj.type.includes(IFC_TYPES.IFCSLab) &&
          (obj.props.some((p: any) => p.name === IFC_PROP.ASSIGNED_ROOM && p.value === roomCode) ||
            floorCodes.some(code => obj.props.some((p: any) => p.name === IFC_PROP.WALL_CODE && p.value === code)))
        );

        console.log("Selected floors ", roomFloors,' and code ', floorCodes);

        // Find ceiling codes associated with this room
        const ceilingCodes: string[] = [];
        room.props.forEach((prop: any) => {
          if (prop.name === IFC_PROP.CEILING_ROOM && prop.value) {
            ceilingCodes.push(prop.value);
          }
        });

        // Find doors associated with this room
        const doors = objects.filter(obj =>
          obj.type.includes(IFC_TYPES.IFCDoor) &&
          obj.props.some((p: any) => p.name === IFC_PROP.ASSIGNED_ROOM && p.value === roomEnclosureType)
        );
        // Find windows associated with this room
        // const windows = objects.filter(obj =>
        //   obj.type.includes(IFC_TYPES.IFCWindow) &&
        //   obj.props.some((p: any) => p.name === IFC_PROP.ASSIGNED_ROOM && p.value === roomEnclosureType)
        // );

        const roomType = getPropValue(room, IFC_PROP.ROOM_TYPE_1) || getPropValue(room, IFC_PROP.ROOM_TYPE_2) || getPropValue(room, IFC_PROP.ROOM_TYPE_3)
        const name = getPropValue(room, IFC_PROP.ROOM_NAME) ;
        if (!name)
          throw new Error(IFC_PROP.ROOM_NAME_ERROR);
        return {
          id: room.id,
          name,
          type:roomEnclosureType,
          properties: {
            roomCode: roomCode,
            roomType,
            occupationProfile: {
              code: roomCode, // CÓDIGO DE RECINTO
              type: getPropValue(room, IFC_PROP.ROOM_TYPE_1) || IFC_PROP.UNKNOWN, // TIPOLOGÍA DE RESINTO
              occupation: getPropValue(room, IFC_PROP.OCCUPATION) || IFC_PROP.UNKNOWN
            },
            level: getPropValue(room, IFC_PROP.LEVEL) || IFC_PROP.UNKNOWN,
            volume: room.volume || getPropValue(room, IFC_PROP.VOLUME) || 0,
            surfaceArea: room.surfaceArea || 0,
            averageHeight: averageWallHeight > 0 ? averageWallHeight :
              (room.dimensions?.z ||
                (room.volume && room.surfaceArea ? room.volume / room.surfaceArea :
                  getPropValue(room, IFC_PROP.HEIGHT) ||
                  (getPropValue(room, IFC_PROP.VOLUME) && getPropValue(room, IFC_PROP.SURFACE_AREA) ?
                    (Number(getPropValue(room, IFC_PROP.VOLUME)) / Number(getPropValue(room, IFC_PROP.SURFACE_AREA))) :
                    IFC_PROP.UNKNOWN))),
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
                obj.type.includes(IFC_TYPES.IFCWall) &&
                obj.props.some((p: any) => p.name === IFC_PROP.WALL_CODE && p.value === code)
              );
              const windows = objects.filter(obj =>
                obj.type.includes(IFC_TYPES.IFCWindow) &&
                obj.props.some((p: any) => p.name === IFC_PROP.ASSIGNED_WALL && p.value === code)
              );
              return {
                code: code,
                windows: windows?.map(window => {
                  return {
                  id: window.id,
                  name: window.name,
                  type: window.type,
                  width: window.dimensions?.x || getPropValue(window, IFC_PROP.WIDTH) || 0,
                  height: window.dimensions?.y || getPropValue(window, IFC_PROP.WINDOW_HEIGHT) || 0,
                  assignedWall: getPropValue(window, IFC_PROP.ASSIGNED_WALL) || IFC_PROP.UNKNOWN,
                  azimut: orientationToAzimutRange(getPropValue(window, 'AZIMUT')),
                  dimensions: window.dimensions || { x: 0, y: 0, z: 0 },
                  position: window.position || { x: 0, y: 0, z: 0 },
                  vectors: window.vectors || null
                }}),
                elements: walls.map(wall => {
                  return {
                    id: wall.id,
                    name: wall.name,
                    area: Number(getPropValue(wall, IFC_PROP.AREA)) || 0,
                    material: getPropValue(wall, IFC_PROP.MATERIAL) || IFC_PROP.UNKNOWN,
                    thickness: getPropValue(wall, IFC_PROP.ESPESOR) || 0,
                    orientation: getPropValue(wall, IFC_PROP.ORIENTACION) || getPropValue(wall, IFC_PROP.ORIENTACION2),
                    location: getPropValue(wall, IFC_PROP.CARAC_ESP_CONT) || IFC_PROP.UNKNOWN,
                    volume: wall.volume || 0,
                    dimensions: wall.dimensions || { x: 0, y: 0, z: 0 },
                    position: wall.position || { x: 0, y: 0, z: 0 },
                    vectors: wall.vectors || null,
                    color: getPropValue(wall, IFC_PROP.COLOR) || 'INTERMEDIO',
                  };
                })
              };
            }),
            floors: floorCodes.map(code => {
              const floors = objects.filter(obj =>
                obj.type.includes(IFC_TYPES.IFCSLab) &&
                obj.props.some((p: any) => p.name === IFC_PROP.WALL_CODE && p.value === code)
              );

              return {
                code: code,
                elements: floors.map(floor => ({
                  id: floor.id,
                  name: floor.name,
                  material: getPropValue(floor, 'MATERIAL') || IFC_PROP.UNKNOWN,
                  color: getPropValue(floor, 'COLOR') || IFC_PROP.UNKNOWN,
                  thickness: floor.dimensions?.z || getPropValue(floor, 'ESPESOR') || 0,
                  keyNote: getPropValue(floor, 'Nota clave') || IFC_PROP.UNKNOWN,
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
                obj.type.includes(IFC_TYPES.IFCSLab) &&
                obj.props.some((p: any) => p.name === IFC_PROP.WALL_CODE && p.value === code)
              );

              return {
                code: code,
                elements: ceilings.map(ceiling => ({
                  id: ceiling.id,
                  name: ceiling.name,
                  material: getPropValue(ceiling, 'MATERIAL') || IFC_PROP.UNKNOWN,
                  color: getPropValue(ceiling, 'COLOR') || IFC_PROP.UNKNOWN,
                  thickness: ceiling.dimensions?.z || getPropValue(ceiling, 'ESPESOR') || 0,
                  keyNote: getPropValue(ceiling, 'Nota clave') || IFC_PROP.UNKNOWN,
                  area: ceiling.surfaceArea || 0,
                  volume: ceiling.volume || 0,
                  dimensions: ceiling.dimensions || { x: 0, y: 0, z: 0 },
                  position: ceiling.position || { x: 0, y: 0, z: 0 },
                  vectors: ceiling.vectors || null
                }))
              };
            }),
            doors: doors.map(door => {
              return {
                id: door.id,
                name: door.name,
                type: door.type || getPropValue(door, 'TIPO') || IFC_PROP.UNKNOWN,
                width: door.dimensions?.x || getPropValue(door.props, IFC_PROP.WIDTH) || 0,
                height: door.dimensions?.y || getPropValue(door.props, IFC_PROP.WINDOW_HEIGHT) || 0,
                assignedWall: getPropValue(door.props, IFC_PROP.ASSIGNED_WALL) || IFC_PROP.UNKNOWN,
                uValue: getPropValue(door.props, 'U') || 0,
                dimensions: door.dimensions || { x: 0, y: 0, z: 0 },
                position: door.position || { x: 0, y: 0, z: 0 },
                vectors: door.vectors || null
              }
            }),

          }
        };
      })
  };

  // Process all objects
  async function processObjectsSequentially(objects: Array<any>) {
    setIsProcessing(true);
    setStatus("Procesando objetos...");
    setIsUploadComplete(false);
    try {
      // Generate structured output
      const building = generateStructuredOutput(objects);
      console.log("Building structure:", building);

      // Use the projectBuilder hook to create the project from the structured data
      setStatus("Creando proyecto...");
      const result = await projectBuilder.createProjectWithValidation(building);
      if (result?.success) {
        setStatus(`Proceso completado: ${result?.completedRooms} recintos creados`);
        notify("Proyecto creado exitosamente");
        setIsUploadComplete(true);
        setIsProcessing(false);
      } else {
        setStatus(`Proceso no logró completarse debido a errores.`);
        console.error("Errors during project creation:", result);
        notify(`Proceso no logró completarse debido a errores`, "error");
        setMissingElements(result.missingElements || []);
        setIsProcessing(false);
        setIsUploadComplete(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el procesamiento';
      console.error("Error processing objects:", error);
      setStatus(`Error: ${errorMessage}`);
      notify(`Error: ${errorMessage}", "error`);
      setIsProcessing(false);
      setIsUploadComplete(false);
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
      <IFCUploader onFileUpload={handleFileUpload} />      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          {fileSelected && !isProcessing && (
            <CustomButton
              onClick={() => processObjectsSequentially(objectsData)}
              disabled={isUploadComplete}
            >
              Procesar Objetos
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

      {/* Botón para ir a editar workflow part 1 */}
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <CustomButton
              color="orange"
              className="mb-3"
              onClick={() => {
                if (projectId) {
                  router.push(`/workflow-part1-edit?id=${projectId}`);
                } else {
                  notify("No hay proyecto seleccionado");
                }
              }}
            >
              Ir a editar datos del proyecto (Workflow Parte 1)
            </CustomButton>
          </Col>
        </Row>
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
