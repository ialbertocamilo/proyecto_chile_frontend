"use client";
import "bootstrap/dist/css/bootstrap.min.css";
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event;
    if (file) {
      loadIFCViewer().then((IFCViewer) => {
        viewerInstance?.unloadModel()
        setViewerInstance(
          new IFCViewer({ canvasId: "myCanvas", modelPath: "./output.ifc.xkt" })
        );
      });
    }
  };

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
        // canvas.width = canvas.width;
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

  useEffect(() => {
    loadIFCViewer().then((IFCViewer) => {
      setViewerInstance(
        new IFCViewer({ canvasId: "myCanvas", modelPath: "./output.ifc.xkt" })
      );
    });
  }, []);


  useEffect(() => {
    if (viewerInstance) {
      viewerInstance?.sceneModel?.on("loaded", async () => {
        setObjectsData(await viewerInstance?.objects);
      })
    }
  }, [viewerInstance])

  return (
    <Card>
      <IFCUploader onFileUpload={handleFileUpload} />
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <CustomButton onClick={handleProcessFile}>
            Procesar Archivo
          </CustomButton>
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
