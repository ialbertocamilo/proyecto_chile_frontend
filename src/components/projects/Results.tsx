import { useApi } from "@/hooks/useApi";
import { notify } from "@/utils/notify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import CustomButton from "../common/CustomButton";
import IndicadoresFinales from "./tabs/IndicadoresFinales";
import ResumenRecintos from "./tabs/ResumenRecintos";

// Define TypeScript interfaces for the data structure
interface DemandaItem {
  concepto: string;
  kwh_m2_ano: number;
  kwh_ano: number;
  vsCasoBase: string;
}

interface HrsDisconfortItem {
  concepto: string;
  hrs_ano: string;
  nota?: string;
}

interface CO2Data {
  total: number;
  unidad: string;
  comparacion: string;
}

interface IndicadoresData {
  demandaData: DemandaItem[];
  consumoPrimario: DemandaItem[];
  hrsDisconfort: HrsDisconfortItem[];
  co2eqData: CO2Data;
}

interface RecintoItem {
  id: number;
  project_id: number;
  name_enclosure: string;
  height: number;
  zona_termica: string;
  usage_profile_name: string;
  nombre_region: string;
  nombre_comuna: string;
  demanda_calef: number;
  demanda_ref: number;
  demanda_ilum: number;
  demanda_total: number;
  consumo_calef: number;
  consumo_ref: number;
  consumo_total: number;
  co2_eq: number;
  [key: string]: any;
}

// Add this interface to match the expected type
interface Recinto {
  id: number;
  name_enclosure: string;
  height: number;
  usage_profile_name: string;
  demanda_calef: number;
  demanda_ref: number;
  demanda_ilum: number;
  demanda_total: number;
  consumo_calef: number;
  consumo_ref: number;
  consumo_total: number;
  co2_eq: number;
  [key: string]: any;
}

const Results = () => {
  const router = useRouter();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recintosData, setRecintosData] = useState<RecintoItem[]>([]);
  const [indicadoresData, setIndicadoresData] = useState<IndicadoresData | null>(null);

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

  const handleRecintosCalculated = (recintos: Recinto[]) => {
    console.log("Recintos calculated:", recintos);
    setRecintosData(recintos as unknown as RecintoItem[]);
  };

  const handleDataUpdate = (data: IndicadoresData) => {
    console.log("Data updated:", data);
    setIndicadoresData(data);
  };

  const generatePDF = async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const projectId = router.query.id;

      // Title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(`Reporte de Proyecto: ${projectId}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.line(14, 32, 196, 32);

      let yPos = 40;

      if (indicadoresData) {
        // Demanda Energética
        doc.setFontSize(14);
        doc.text("Demanda Energética", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Concepto", "kWh/m²·año", "kWh/año", "vs Caso Base"]],
          body: indicadoresData.demandaData.map(item => [
            item.concepto,
            item.kwh_m2_ano.toFixed(1),
            item.kwh_ano.toFixed(1),
            item.vsCasoBase
          ]),
          theme: 'striped',
          headStyles: { fillColor: [42, 176, 197] }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Consumo de Energía Primaria
        doc.setFontSize(14);
        doc.text("Consumo de Energía Primaria", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Concepto", "kWh/m²·año", "kWh/año", "vs Caso Base"]],
          body: indicadoresData.consumoPrimario.map(item => [
            item.concepto,
            item.kwh_m2_ano.toFixed(1),
            item.kwh_ano.toFixed(1),
            item.vsCasoBase
          ]),
          theme: 'striped',
          headStyles: { fillColor: [42, 176, 197] }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Horas de Disconfort
        doc.setFontSize(14);
        doc.text("Horas de Disconfort", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Concepto", "Horas/año"]],
          body: indicadoresData.hrsDisconfort.map(item => [
            item.concepto,
            item.hrs_ano
          ]),
          theme: 'striped',
          headStyles: { fillColor: [42, 176, 197] }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // CO2 Equivalente
        doc.setFontSize(14);
        doc.text("CO2 Equivalente", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Total", "Unidad", "Comparación con Caso Base"]],
          body: [[
            indicadoresData.co2eqData.total.toFixed(1),
            indicadoresData.co2eqData.unidad,
            indicadoresData.co2eqData.comparacion
          ]],
          theme: 'striped',
          headStyles: { fillColor: [42, 176, 197] }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Add a new page for recintos data
      if (recintosData && recintosData.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Resumen de Recintos", 14, 20);

        autoTable(doc, {
          startY: 30,
          head: [["Recinto", "Zona Térmica", "Perfil de Uso", "Demanda Total", "Consumo Total", "CO2 eq"]],
          body: recintosData.map(item => [
            item.name_enclosure,
            item.zona_termica,
            item.usage_profile_name,
            item.demanda_total.toFixed(2),
            item.consumo_total.toFixed(2),
            item.co2_eq.toFixed(2)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [42, 176, 197] }
        });
      }

      // Save the PDF
      doc.save(`Reporte_Proyecto_${projectId}.pdf`);
      notify("Reporte PDF generado con éxito");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      notify("Error al generar el reporte PDF", "error");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleForceRecalculation = async () => {
    try {
      setIsRecalculating(true);
      const projectId = router.query.id;
      if (projectId) {
        await get(`/calculator/${projectId}?force_calculation=true`);
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

        <CustomButton
          color="red"
          onClick={generatePDF}
          className="mb-3"
          disabled={generatingPdf || !indicadoresData}
        >
          <FileText size={18} style={{ marginRight: 8 }} />
          Generar Reporte PDF
        </CustomButton>
        {generatingPdf && (
          <span style={{ minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
            <Spinner animation="border" size="sm" role="status" />
            <span>Generando PDF...</span>
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
              <IndicadoresFinales onDataUpdate={handleDataUpdate} />
            </Tab>
          </Tabs>

        </>
      )}
    </Container>
  );
};

export default Results;
