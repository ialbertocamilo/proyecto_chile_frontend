import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import "../public/assets/css/globals.css";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState("300px");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth =
        localStorage.getItem("isAuthenticated") ||
        sessionStorage.getItem("isAuthenticated");
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      console.log("🔍 isAuthenticated:", storedAuth);
      console.log("🔍 Token:", token);

      if (storedAuth === "true" && token) {
        console.log("Usuario autenticado. Mostrando Dashboard.");
        setIsAuthenticated(true);
      } else {
        console.log("No autenticado. Redirigiendo a /login...");
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    setTimeout(checkAuth, 500);
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="text-center mt-5" style={{ fontFamily: "var(--font-family-base)" }}>
        <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>Cargando...</h2>
      </div>
    );
  }

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
          <div className="text-center mt-5">
            <h1 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              ¡Bienvenido!
            </h1>
            <p>Gestiona tus proyectos de manera eficiente.</p>
            <i
              className="bi bi-bar-chart-fill"
              style={{ fontSize: "50px", color: "var(--primary-color)" }}
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
