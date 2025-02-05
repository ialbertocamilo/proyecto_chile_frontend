import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../src/components/layout/Navbar";
import TopBar from "../src/components/layout/TopBar";
import ProjectList from "../src/components/forms/ProjectList";
import ProjectWorkflow from "../src/components/forms/ProjectWorkflow";

const Dashboard = () => {
  const [activeView, setActiveView] = useState<string>("projects");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
      console.log("🔍 isAuthenticated:", storedAuth);
      console.log("🔍 Token:", token);
  
      if (storedAuth === "true" && token) {
        console.log("✅ Usuario autenticado. Mostrando Dashboard.");
        setIsAuthenticated(true);
      } else {
        console.log("❌ No autenticado. Redirigiendo a /login...");
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };
  
    setTimeout(checkAuth, 500);
  }, [router]);
  

  // hasta verificar la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="text-center mt-5">
        <h2 className="fw-bold text-primary">Cargando...</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "projectWorkflow":
        return <ProjectWorkflow setActiveView={setActiveView} />;
      case "projects":
        return <ProjectList setActiveView={setActiveView} />;
      default:
        return (
          <div className="text-center mt-5">
            <h1 className="fw-bold text-primary">¡Bienvenido!</h1>
            <p>Gestiona tus proyectos de manera eficiente.</p>
            <i className="bi bi-bar-chart-fill text-primary" style={{ fontSize: "50px" }}></i>
          </div>
        );
    }
  };

  return (
    <div className="d-flex">
      <Navbar setActiveView={setActiveView} />
      <div className="d-flex flex-column flex-grow-1" style={{ marginLeft: "0px", width: "100%" }}>
        <TopBar />
        <div className="content p-4" style={{ marginTop: "60px" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
