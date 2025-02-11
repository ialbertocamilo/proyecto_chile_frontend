import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import CustomButton from "../src/components/common/CustomButton";
import { constantUrlApiEndpoint } from "../src/utils/constant-url-endpoint";
import "../public/assets/css/globals.css";

interface CustomizationData {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo?: File | null;
}

const SettingsPage = () => {
  const router = useRouter();
  const [customization, setCustomization] = useState<CustomizationData>({
    primary_color: "",
    secondary_color: "",
    background_color: "",
    logo: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("300px");

  // Obtener la configuracion actual 
  useEffect(() => {
    const fetchCustomization = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No estás autenticado. Inicia sesión.");
        }
        const response = await fetch(
          `${constantUrlApiEndpoint}/customization`,
          {
            method: "GET",
            headers: {
              "accept": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || errorData.message || "Error al obtener configuración"
          );
        }
        const data = await response.json();
        setCustomization({
          primary_color: data.primary_color || "",
          secondary_color: data.secondary_color || "",
          background_color: data.background_color || "",
          logo: null,
        });
      } catch (err: any) {
        console.error("Error fetching customization:", err);
        setError(err.message || "Error al obtener la configuración");
      } finally {
        setFetching(false);
      }
    };

    fetchCustomization();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomization({
      ...customization,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomization({
        ...customization,
        logo: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const { primary_color, secondary_color, background_color } = customization;
    if (!primary_color.trim() || !secondary_color.trim() || !background_color.trim()) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor, completa los campos obligatorios.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado. Inicia sesión.");
      }

      const formData = new FormData();
      formData.append("primary_color", primary_color);
      formData.append("secondary_color", secondary_color);
      formData.append("background_color", background_color);
      if (customization.logo) {
        formData.append("logo", customization.logo, customization.logo.name);
      }

      const response = await fetch(
        `${constantUrlApiEndpoint}/customizer`,
        {
          method: "PUT",
          headers: {
            "accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error actualizando configuración:", errorData);
        throw new Error(
          errorData.detail ||
            errorData.message ||
            "No se pudo actualizar la configuración"
        );
      }

      const resData = await response.json();
      await Swal.fire({
        title: "Configuración actualizada",
        text: resData.message || "La configuración se actualizó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error actualizando configuración:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Error al actualizar la configuración",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      setError(err.message || "Error al actualizar la configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ fontFamily: "var(--font-family-base)" }}>
      <Navbar setActiveView={() => {}} setSidebarWidth={setSidebarWidth} />
      <div
        className="d-flex flex-column flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          width: "100%",
        }}
      >
        <TopBar sidebarWidth={sidebarWidth} />
        <div className="container p-4" style={{ marginTop: "60px" }}>
          {/* Encabezado y botones */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2
              className="fw-bold"
              style={{
                color: "var(--primary-color)",
                margin: 0,
                fontFamily: "var(--font-family-base)",
              }}
            >
              Configuración de Personalización
            </h2>
            <div className="d-flex" style={{ gap: "1rem" }}>
              <CustomButton
                variant="back"
                onClick={() => router.push("/dashboard")}
              >
                ← Regresar
              </CustomButton>
              <CustomButton
                variant="save"
                type="submit"
                form="settingsForm"
                disabled={loading || fetching}
              >
                {loading ? "Guardando..." : "Guardar Configuración"}
              </CustomButton>
            </div>
          </div>
          {fetching ? (
            <p
              className="text-primary"
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              Cargando configuración...
            </p>
          ) : (
            <form
              id="settingsForm"
              onSubmit={handleSubmit}
              style={{ fontFamily: "var(--font-family-base)" }}
            >
              {error && (
                <p
                  className="text-danger"
                  style={{ fontFamily: "var(--font-family-base)" }}
                >
                  {error}
                </p>
              )}
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Color Primario *
                </label>
                <input
                  type="text"
                  name="primary_color"
                  className="form-control"
                  value={customization.primary_color}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Color Secundario *
                </label>
                <input
                  type="text"
                  name="secondary_color"
                  className="form-control"
                  value={customization.secondary_color}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Color de Fondo *
                </label>
                <input
                  type="text"
                  name="background_color"
                  className="form-control"
                  value={customization.background_color}
                  onChange={handleChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
              <div className="mb-3">
                <label style={{ fontFamily: "var(--font-family-base)" }}>
                  Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  accept="image/png, image/jpeg"
                  className="form-control"
                  onChange={handleFileChange}
                  style={{ fontFamily: "var(--font-family-base)" }}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
