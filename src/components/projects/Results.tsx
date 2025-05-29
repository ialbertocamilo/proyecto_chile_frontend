import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import { Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { memo, useEffect, useState, useRef } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import CustomButton from "../common/CustomButton";
import WebSocketComponent from "../common/WebSocketComponent";
import IndicadoresFinales from "./tabs/IndicadoresFinales";
import ResumenRecintos from "./tabs/ResumenRecintos";
const MemoizedResumenRecintos = memo(ResumenRecintos);

const Results = () => {
  const router = useRouter();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const webSocketRef = useRef<any>(null);


  const [calculationResult, setCalculationResult] = useState<any>(null);



  const processData = async () => {
    try {
      const projectId = router.query.id;
      if (projectId) {
        await get(`/calculator/${projectId}`);
        setIsButtonDisabled(false);
      }
    } catch (error) {
      console.error("Error processing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.id) {
      processData();
    }
  }, [router.query.id]);

  const handleUpdate = ((data: any) => {
    console.log("GUARDANDO :", data);
    // Removed setRecintos usage
  });

  const handleForceRecalculation = async () => {
    try {
      setIsRecalculating(true);
      // Limpiar notificaciones antes de recalcular
      webSocketRef.current?.clearNotifications?.();
      const projectId = router.query.id;
      if (projectId) {
        const result = await get(`/calculator/${projectId}?force_calculation=true`);
        setCalculationResult(result);
        notify("Recálculo completado exitosamente");
      }
    } catch (error) {
      console.error("Error al forzar recálculo:", error);
      notify("Error al forzar recálculo", "error");
    } finally {
      setIsRecalculating(false);
    }
  };

  const api = useApi();
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 mt-2">Resultados finales</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>


        <CustomButton
          onClick={handleForceRecalculation}
          className="mb-3"
          disabled={isRecalculating}
        >
          <RefreshCw size={18} style={{ marginRight: 8 }} />
          Forzar recálculo
        </CustomButton>
        {isRecalculating && (
          <span style={{ minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
            <Spinner animation="border" size="sm" role="status" />
            <span>Recalculando...</span>
          </span>
        )}
        <CustomButton
          color="orange"
          onClick={async () => {
            setIsButtonDisabled(true);
            setIsDownloading(true);
            try {
              const projectId = router.query.id;
              const response = await api.get(
                `/calculator/download/${projectId}`,
                {
                  responseType: "blob",
                }
              );
              const blob = response;
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${projectId}_files.zip`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
              notify("Archivos descargados exitosamente.");
              setIsDownloading(false);
              setIsButtonDisabled(false);
            } catch (error) {
              console.error("Error al descargar los archivos:", error);
              notify("Error al descargar los archivos", "error");
              setIsDownloading(false);
              setIsButtonDisabled(false);
            }
          }}
          className="mb-3"
          disabled={isButtonDisabled}
        >
          <Download size={18} style={{ marginRight: 8 }} />
          Descargar archivos procesados
        </CustomButton>
        {isDownloading && (
          <span style={{ minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
            <Spinner animation="border" size="sm" role="status" />
            <span>Descargando...</span>
          </span>
        )}

      </div>

      <WebSocketComponent
        ref={webSocketRef}
        path={``}
        onMessageReceived={(message) => {
          if (message?.notificationType == 'result') {
            // Only use the new data structure
            const enclosures = JSON.parse(message?.payload?.result_by_enclosure_v2 || '[]');
            const baseEnclosures = JSON.parse(message?.payload?.base_by_enclosure_v2 || '[]');
            const finalIndicators = message?.payload?.final_indicators;

            console.log("Enclosures:", enclosures);
            console.log("Base Enclosures:", baseEnclosures);
            console.log("Finals:", finalIndicators);

            setCalculationResult({
              result_by_enclosure_v2: enclosures,
              base_by_enclosure_v2: baseEnclosures,
              final_indicators: finalIndicators
            });
          }
        }}
      />
      <br />
      {loading ? (
        <div className="text-center">Procesando datos...</div>
      ) : (
        <>          <Tabs
          defaultActiveKey="recintos"
          id="results-tabs"
          className="mb-4 custom-tabs"
          style={{
            "--bs-nav-tabs-link-active-color": "var(--primary-color)",
            "--bs-nav-link-font-weight": "normal",
            fontFamily: "var(--font-family-base)",
            border: "none",
            "--bs-nav-link-color": "#bbc4cb",
            "--bs-nav-link-hover-color": "rgb(42, 176, 197)",
            "--bs-nav-tabs-link-hover-border-color": "transparent",
            "--bs-nav-tabs-link-active-border-color":
              "transparent transparent rgb(42, 176, 197) transparent",
            "--bs-nav-tabs-border-width": "3px",
            "--bs-nav-tabs-border-radius": "0px",
            "--bs-nav-link-padding-x": "10px",
            "--bs-nav-link-padding-y": "10px",
          } as React.CSSProperties}
        >

          <Tab eventKey="recintos" title="Resumen de Recintos">
            <MemoizedResumenRecintos
              globalResults={calculationResult}
              onUpdated={handleUpdate}
            />
          </Tab>

          <Tab eventKey="indicadores" title="Indicadores Finales">
            <IndicadoresFinales finalIndicators={calculationResult?.final_indicators} />
          </Tab>
        </Tabs>

        </>
      )}
    </Container>
  );
};

export default Results;
