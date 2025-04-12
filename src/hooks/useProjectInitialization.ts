import { useEffect, useState } from "react";
import useProjectId from "@/hooks/useProjectId";

const useProjectInitialization = () => {
  const { projectId, setProjectId } = useProjectId(); // Use the useProjectId hook
  const [projectName, setProjectName] = useState<string>("Nombre no definido");
  const [projectDepartment, setProjectDepartment] =
    useState<string>("Región no definida");
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  useEffect(() => {
    const storedProjectName =
      localStorage.getItem("project_name") || "Nombre no definido";
    const storedProjectDepartment =
      localStorage.getItem("project_department") || "Región no definida";
    setProjectName(storedProjectName);
    setProjectDepartment(storedProjectDepartment);
    setHasLoaded(true);
  }, []);

  return { projectId, projectName, projectDepartment, hasLoaded, setProjectId };
};

export default useProjectInitialization;
