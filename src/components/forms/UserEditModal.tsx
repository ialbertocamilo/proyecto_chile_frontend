import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface UserEditModalProps {
  show: boolean;
  handleClose: () => void;
  user: {
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    country?: string;
    ubigeo?: string;
  };
  onSave: (user: any) => void;
}

const UserEditModal = ({ show, handleClose, user, onSave }: UserEditModalProps) => {
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    setFormData(user || {});
  }, [user]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
};

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="name" value={formData.name || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control type="email" name="email" value={formData.email || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="text" name="phone" value={formData.phone || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control type="date" name="birthDate" value={formData.birthDate || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>País</Form.Label>
            <Form.Control type="text" name="country" value={formData.country || ""} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubigeo</Form.Label>
            <Form.Control type="text" name="ubigeo" value={formData.ubigeo || ""} onChange={handleChange} required />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Guardar Cambios
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserEditModal;
