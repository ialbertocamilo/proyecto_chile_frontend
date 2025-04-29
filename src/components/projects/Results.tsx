import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import Card from "../common/Card";
import CustomButton from "../common/CustomButton";
import AguaCalienteSanitaria from "./tabs/AguaCalienteSanitaria";
import IndicadoresFinales from "./tabs/IndicadoresFinales";
import ResumenRecintos from "./tabs/ResumenRecintos";

const Results = () => {
  const router = useRouter();
  const { get } = useApi();
  const [loading, setLoading] = useState(true); // Loader state
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button state
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
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 mt-2">Resultados finales</h2>
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
                "--bs-nav-tabs-border-color": "var(--primary-color)",
                "--bs-nav-tabs-link-hover-color": "var(--primary-color)",
                "--bs-nav-tabs-link-hover-bg": "#f8f9fa",
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
          <Card>
            <CustomButton
              onClick={async () => {
                try {
                  const projectId = router.query.id;

                  // Proceed to download the generated file
                  const response = await get(
                    `/calculator/download/${projectId}`,
                    { responseType: "blob" }
                  );
                  const blob = response.data;
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `project_${projectId}_data.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  notify("Datos descargados exitosamente.");
                } catch (error) {
                  console.error("Error al descargar los datos:", error);
                  alert(
                    "Ocurrió un error al descargar los datos. Por favor, inténtelo nuevamente."
                  );
                }
              }}
              className="mb-3"
              disabled={isButtonDisabled}
            >
              Descarga datos procesados por el motor
            </CustomButton>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Results;
