import React from 'react';

const NewProjectForm = () => {
  return (
    <div className="content p-4">
      <h4 className="fw-bold">Información del proyecto nuevo</h4>
      <form>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nombre de propietario</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Apellidos de propietario</label>
            <input type="text" className="form-control" />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Profesión u oficio</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Director responsable de obra</label>
            <input type="text" className="form-control" />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email de contacto</label>
            <input type="email" className="form-control" />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nombre del proyecto</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Nombre del diseñador</label>
            <input type="text" className="form-control" />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label">Clasificación de edificaciones</label>
            <div className="d-flex">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="clasificacion"
                  id="viviendas"
                />
                <label className="form-check-label" htmlFor="viviendas">
                  Viviendas
                </label>
              </div>
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="clasificacion"
                  id="oficinas"
                />
                <label className="form-check-label" htmlFor="oficinas">
                  Oficinas
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="clasificacion"
                  id="terciarios"
                />
                <label className="form-check-label" htmlFor="terciarios">
                  Terciarios
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label">Tipo de edificación</label>
            <div className="d-flex">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoEdificacion"
                  id="unifamiliar"
                />
                <label className="form-check-label" htmlFor="unifamiliar">
                  Unifamiliar
                </label>
              </div>
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoEdificacion"
                  id="duplex"
                />
                <label className="form-check-label" htmlFor="duplex">
                  Duplex
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoEdificacion"
                  id="vertical"
                />
                <label className="form-check-label" htmlFor="vertical">
                  Vertical / Departamentos
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Número de niveles</label>
            <input type="number" className="form-control" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Número de viviendas u oficinas por nivel</label>
            <input type="number" className="form-control" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Superficie construida m2</label>
            <input type="number" className="form-control" />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Departamento</label>
            <select className="form-select">
              <option value="">Selecciona</option>
              <option value="dep1">Departamento 1</option>
              <option value="dep2">Departamento 2</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Municipio</label>
            <select className="form-select">
              <option value="">Selecciona</option>
              <option value="mun1">Municipio 1</option>
              <option value="mun2">Municipio 2</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          Guardar proyecto
        </button>
      </form>
    </div>
  );
};

export default NewProjectForm;
