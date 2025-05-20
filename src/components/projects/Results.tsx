import { useRecintos } from "@/context/RecintosContext";
import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import { Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import CustomButton from "../common/CustomButton";
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


  const [calculationResult, setCalculationResult] = useState<any>(null);
  const { setRecintos } = useRecintos();

  const processData = useCallback(async () => {
    console.log("Starting processData");
    try {
      const projectId = router.query.id;
      if (projectId) {
        const result = await get(`/calculator/${projectId}`);
        setCalculationResult(result);
        setIsButtonDisabled(false);
      }
    } catch (error) {
      console.error("Error al procesar los datos:", error);
      notify("Se termino de procesar la información");
    } finally {
      setLoading(false);
    }
  }, [router.query.id]);

  useEffect(() => {
    if (router.query.id) processData();
  }, [router.query.id, processData]);




  const handleRecintosCalculated = ((data: any) => {
    console.log("Guardando recintos:", data);
    setRecintos(data);
  });

  const handleForceRecalculation = async () => {
    try {
      setIsRecalculating(true);
      const projectId = router.query.id;
      if (projectId) {
        // Guardar el resultado en la misma variable de estado
        const result = await get(`/calculator/${projectId}?force_calculation=true`);
        setCalculationResult(result);

        notify("Recálculo completado exitosamente");
        // Refresh data after recalculation
        await processData();
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
        >          <Tab eventKey="recintos" title="Resumen de Recintos">
            <MemoizedResumenRecintos
              globalResults={calculationResult}
              onUpdated={handleRecintosCalculated}
            />
          </Tab>          <Tab eventKey="indicadores" title="Indicadores Finales">
            <IndicadoresFinales />
          </Tab>
        </Tabs>

        </>
      )}
    </Container>
  );
};

export default Results;
