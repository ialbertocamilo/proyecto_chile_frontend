import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import { Download } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import CustomButton from "../common/CustomButton";
import IndicadoresFinales from "./tabs/IndicadoresFinales";
import ResumenRecintos from "./tabs/ResumenRecintos";

const Results = () => {
  const router = useRouter();
  const { get } = useApi();
  const [loading, setLoading] = useState(true); 
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); 
  const processData = async () => {
    try {
      const projectId = router.query.id;
      if (projectId) {
        await get(`/calculator/${projectId}`);
        setIsButtonDisabled(false);
      }
    } catch (error) {
      console.error("Error al procesar los datos:", error);
      notify("Se termino de procesar la información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.id) processData();
  }, [router.query.id]);

  const handleRecintosCalculated = (recintos: any[]) => {
    console.log("Recintos calculated:", recintos);
  };

  const api = useApi();
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 mt-2">Resultados finales</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
        <>
          <Tabs
            defaultActiveKey="recintos"
            id="results-tabs"
            className="mb-4 custom-tabs"
            style={
              {
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
              } as React.CSSProperties
            }
          >
            {/* <Tab eventKey="acs" title="Agua Caliente Sanitaria">
                            <AguaCalienteSanitaria />
                        </Tab> */}
            <Tab eventKey="recintos" title="Resumen de Recintos">
              <ResumenRecintos
                onRecintosCalculated={handleRecintosCalculated}
              />
            </Tab>
            <Tab eventKey="indicadores" title="Indicadores Finales">
              <IndicadoresFinales />
            </Tab>
          </Tabs>

        </>
      )}
    </Container>
  );
};

export default Results;
