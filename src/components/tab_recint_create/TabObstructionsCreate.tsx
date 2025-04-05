import React, { useState, useEffect, KeyboardEvent } from "react";
import TablesParameters from "@/components/tables/TablesParameters";
import CustomButton from "../common/CustomButton";
import { notify } from "@/utils/notify";
import { constantUrlApiEndpoint } from "@/utils/constant-url-endpoint";
import ModalCreate from "../common/ModalCreate";
import ActionButtons from "@/components/common/ActionButtons";
import ActionButtonsConfirm from "@/components/common/ActionButtonsConfirm";

interface ObstructionsData {
  id: number;
  index: number;
  división: string;
  floor_id: number;
  b: number;
  a: number;
  d: number;
  anguloAzimut: string;
  orientación: any;
  obstrucción: number;
}

const ObstructionTable: React.FC = () => {
  const [tableData, setTableData] = useState<ObstructionsData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  // Modal para crear Obstrucciones (ya existente)
  const [showModal, setShowModal] = useState(false);
  const [angleOptions, setAngleOptions] = useState<string[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<string>("");
  // Estado para controlar la visibilidad del botón "+"
  const [showPlus, setShowPlus] = useState<boolean>(true);

  // Nuevo estado para el modal de creación de División
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("División 1");
  const [aValue, setAValue] = useState<string>("");
  const [bValue, setBValue] = useState<string>("");
  const [dValue, setDValue] = useState<string>("");

  // Para efectos del ejemplo, se usa un orientation_id fijo.
  // En producción, este valor se obtendrá al crear la orientación.
  const orientationId = 6;

  // Definición de columnas para la tabla de obstrucciones
  const columns = [
    {
      headerName: (
        <div className="d-flex align-items-center">
          <span>División</span>
          <CustomButton
            onClick={() => setShowDivisionModal(true)}
            style={{ marginLeft: "5px" }}
          >
            <i className="fa fa-plus" />
          </CustomButton>
        </div>
      ),
      field: "división",
      renderCell: (row: ObstructionsData) => row.división,
    },
    {
      headerName: "A [m]",
      field: "a",
      renderCell: (row: ObstructionsData) => row.a === 0 ? "-" : row.a,
    },
    {
      headerName: "B [m]",
      field: "b",
      renderCell: (row: ObstructionsData) => row.b === 0 ? "-" : row.b,
    },
    {
      headerName: "D [m]",
      field: "d",
      renderCell: (row: ObstructionsData) => row.d === 0 ? "-" : row.d,
    },
    {
      headerName: "Ángulo Azimut",
      field: "anguloAzimut",
      renderCell: (row: ObstructionsData) => row.anguloAzimut,
    },
    {
      headerName: "Orientación",
      field: "orientación",
      renderCell: (row: ObstructionsData) => row.orientación ? row.orientación : "-",
    },
    {
      headerName: "Obstrucción",
      field: "obstrucción",
      renderCell: (row: ObstructionsData) => row.obstrucción === 0 ? "-" : row.obstrucción,
    },
    {
      headerName: "Acciones",
      field: "acciones",
      renderCell: (row: ObstructionsData) => row.id,
    },
  ];

  // Se carga la información del endpoint cuando se abre el modal de Obstrucciones
  useEffect(() => {
    if (showModal) {
      fetch("https://ceela-backend-qa.svgdev.tech/angle-azimut", {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMCwiZXhwIjoxNzQzOTcwMzMwfQ.zDQSviBiNI0pDmspSLgGaW9RDKKqrdOEStwhfgnoKhc"
        }
      })
        .then((response) => response.json())
        .then((data: string[]) => {
          setAngleOptions(data);
          if (data.length > 0) {
            setSelectedAngle(data[0]);
          }
        })
        .catch((error) => {
          console.error("Error fetching angle azimut options:", error);
          notify("Error al cargar las opciones de ángulo azimut", "error");
        });
    }
  }, [showModal]);

  // Manejador del cambio en el select para ángulo azimut
  const handleAngleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAngle(event.target.value);
  };

  // Función para cerrar el modal de Obstrucciones
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Función para crear la orientación (ya existente)
  const handleCreateObstruction = () => {
    const enclosureId = localStorage.getItem("recinto_id");
    if (!enclosureId) {
      notify("No se encontró el recinto_id en el LocalStorage", "error");
      return;
    }
    fetch(`${constantUrlApiEndpoint}/orientation-create/${enclosureId}`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMCwiZXhwIjoxNzQzOTcwMzMwfQ.zDQSviBiNI0pDmspSLgGaW9RDKKqrdOEStwhfgnoKhc",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ azimut: selectedAngle })
    })
      .then(response => response.json())
      .then(data => {
        const newObstruction: ObstructionsData = {
          id: tableData.length + 1,
          index: tableData.length + 1,
          división: "-", 
          floor_id: 0,
          b: 0,
          a: 0,
          d: 0,
          anguloAzimut: selectedAngle,
          orientación: data.orientation,
          obstrucción: 0,
        };

        setTableData([...tableData, newObstruction]);
        setShowPlus(true);
        setShowModal(false);
        notify("Obstrucción creada correctamente", "success");
      })
      .catch((error) => {
        console.error("Error al crear orientación:", error);
        notify("Error al crear orientación", "error");
      });
  };

  // Función para prevenir la entrada del guion "-" en los inputs numéricos
  const preventMinus = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-") {
      e.preventDefault();
    }
  };

  // Función para crear la División actualizando la fila existente
const handleCreateDivision = () => {
  // Validar que los campos tengan valores numéricos mayores o iguales a 0
  if (
    aValue === "" ||
    bValue === "" ||
    dValue === "" ||
    Number(aValue) < 0 ||
    Number(bValue) < 0 ||
    Number(dValue) < 0
  ) {
    notify("Los valores de A, B y D deben ser números no negativos", "error");
    return;
  }

  const payload = {
    division: selectedDivision,
    a: Number(aValue),
    b: Number(bValue),
    d: Number(dValue)
  };

  fetch(`${constantUrlApiEndpoint}/division-create/${orientationId}`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMCwiZXhwIjoxNzQzOTcwMzMwfQ.zDQSviBiNI0pDmspSLgGaW9RDKKqrdOEStwhfgnoKhc",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      // Buscar la primera fila que tenga división "-" (valor por defecto)
      const indexToUpdate = tableData.findIndex(row => row.división === "-");
      if (indexToUpdate === -1) {
        notify("No se encontró una fila para actualizar la división", "error");
        return;
      }
      // Actualizar la fila encontrada con los valores de división y dimensiones
      const updatedRow: ObstructionsData = {
        ...tableData[indexToUpdate],
        división: data.division, // o payload.division
        a: data.a,
        b: data.b,
        d: data.d
      };

      // Actualizar el array de datos manteniendo los demás registros
      setTableData(prevData =>
        prevData.map((row, idx) => (idx === indexToUpdate ? updatedRow : row))
      );

      // Reiniciar los campos del modal
      setSelectedDivision("División 1");
      setAValue("");
      setBValue("");
      setDValue("");
      setShowDivisionModal(false);
      notify("División creada correctamente", "success");
    })
    .catch((error) => {
      console.error("Error al crear División:", error);
      notify("Error al crear División", "error");
    });
};


  return (
    <div>
      {tableLoading ? (
        <div className="text-center p-4">
          <p>Cargando datos de pisos...</p>
        </div>
      ) : (
        <TablesParameters columns={columns} data={tableData} />
      )}
      <div style={{ marginTop: "20px" }}>
        <div className="d-flex justify-content-end gap-2 w-100">
          <CustomButton variant="save" onClick={() => setShowModal(true)}>
            Crear Obstrucciones
          </CustomButton>
        </div>
      </div>

      {/* Modal existente para crear obstrucciones */}
      <ModalCreate 
        isOpen={showModal} 
        saveLabel="Grabar Datos" 
        onClose={handleCloseModal}
        onSave={handleCreateObstruction}
        title="Crear Obstrucción"
      >
        <div className="form-group">
          <label htmlFor="angleAzimutSelect">Ángulo Azimut</label>
          <select
            id="angleAzimutSelect"
            className="form-control"
            value={selectedAngle}
            onChange={handleAngleChange}
          >
            {angleOptions.map((angle, index) => (
              <option key={index} value={angle}>
                {angle}
              </option>
            ))}
          </select>
        </div>
      </ModalCreate>

      {/* Nuevo Modal para crear División */}
      <ModalCreate 
        isOpen={showDivisionModal} 
        saveLabel="Grabar Datos" 
        onClose={() => setShowDivisionModal(false)}
        onSave={handleCreateDivision}
        title="Crear División"
      >
        <div className="form-group">
          <label htmlFor="divisionSelect">División</label>
          <select
            id="divisionSelect"
            className="form-control"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            {["División 1", "División 2", "División 3", "División 4", "División 5"].map((div, index) => (
              <option key={index} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-2">
          <label htmlFor="aInput">A [m]</label>
          <input
            id="aInput"
            type="number"
            className="form-control"
            min={0}
            value={aValue}
            onChange={(e) => setAValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
        <div className="form-group mt-2">
          <label htmlFor="bInput">B [m]</label>
          <input
            id="bInput"
            type="number"
            className="form-control"
            min={0}
            value={bValue}
            onChange={(e) => setBValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
        <div className="form-group mt-2">
          <label htmlFor="dInput">D [m]</label>
          <input
            id="dInput"
            type="number"
            className="form-control"
            min={0}
            value={dValue}
            onChange={(e) => setDValue(e.target.value)}
            onKeyDown={preventMinus}
          />
        </div>
      </ModalCreate>
    </div>
  );
};

export default ObstructionTable;
