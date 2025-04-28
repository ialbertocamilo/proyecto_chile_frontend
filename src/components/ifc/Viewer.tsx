"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import Card from "../common/Card";
import CustomButton from "../common/CustomButton";
import IFCUploader from "./IfcUploader";

const loadIFCViewer = async () => {
  const { default: IFCViewer } = await import("@bytestone/ifc-component");
  return IFCViewer;
};

export default function IFCViewerComponent() {
  const [viewerInstance, setViewerInstance] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event;
    if (file) {
      loadIFCViewer().then((IFCViewer) => {
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
        canvas.width = canvas.width;
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

  return (
    <Card>
      <IFCUploader onFileUpload={handleFileUpload} />
      <CustomButton style={{ float: "right" }} onClick={handleProcessFile}>
        Procesar Archivo
      </CustomButton>
      <div className="viewer-container">
        <div id="treeViewContainer"></div>
        <div id="canvasContainer">
          <canvas id="myCanvas" />
        </div>
        <style jsx>{`
          .viewer-container {
            display: flex;
            width: 100%;
            height: 100dvh;
            position: relative;
            background: #f8f9fa;
          }

          #treeViewContainer {
            width: 300px;
            height: 100%;
            overflow-y: auto;
            background-color: #ffffff;
            padding: 1rem;
            border-right: 1px solid #e9ecef;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
          }

          #canvasContainer {
            flex: 1;
            height: 100%;
            position: relative;
            background: #fff;
          }

          #myCanvas {
            width: 100%;
            height: 100%;
            touch-action: none;
          }

          /* Tree View Styles */
          #treeViewContainer ul {
            list-style: none;
            padding-left: 1.25rem;
            margin: 0.25rem 0;
          }

          #treeViewContainer ul li {
            padding: 0.35rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          #treeViewContainer ul li a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            color: #495057;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          #treeViewContainer ul li span {
            font-size: 0.9rem;
            color: #495057;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          #treeViewContainer ul li span:hover {
            background: #e9ecef;
            cursor: pointer;
          }

          .highlighted-node {
            background: #e9ecef;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .viewer-container {
              flex-direction: column;
            }

            #treeViewContainer {
              width: 100%;
              height: 40vh;
              border-right: none;
              border-bottom: 1px solid #e9ecef;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }

            #canvasContainer {
              height: 60vh;
            }
          }

          /* Context Menu Styles */
          .xeokit-context-menu {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 0.5rem 0;
          }

          .xeokit-context-menu-item {
            padding: 0.5rem 1rem;
            transition: background 0.2s ease;
          }

          .xeokit-context-menu-item:hover {
            background: #f8f9fa;
          }

          /* Measurement Styles */
          .xeokit-measurements-plugin-marker {
            background: white;
            border: 2px solid #0d6efd;
            color: #0d6efd;
            font-weight: 500;
          }

          .xeokit-measurements-plugin-distance-label {
            background: white;
            border: 2px solid #0d6efd;
            color: #0d6efd;
            font-weight: 500;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </Card>
  );
}
