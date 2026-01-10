import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Upload,
  message,
  Row,
  Col,
  Space,
  Image,
} from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CameraOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import visitorService from '../../services/visitorService';
import { useTheme } from '../../context/useTheme.jsx';

const { TextArea } = Input;
const { Option } = Select;

const NewVisitor = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const visitorData = {
        ...values,
        photo: photoFile,
        idDocument: idDocumentFile,
      };

      await visitorService.create(visitorData);
      message.success('Visitante creado exitosamente');
      navigate('/visitors');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al crear visitante');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (info) => {
    // Obtener el archivo - info.file puede ser el File directo o tener originFileObj
    const file = info.file.originFileObj || info.file;
    
    // Verificar que sea un archivo válido (Blob o File)
    if (file && (file instanceof File || file instanceof Blob)) {
      setPhotoFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocumentChange = (info) => {
    // Obtener el archivo - info.file puede ser el File directo o tener originFileObj
    const file = info.file.originFileObj || info.file;
    
    // Verificar que sea un archivo válido (Blob o File)
    if (file && (file instanceof File || file instanceof Blob)) {
      setIdDocumentFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setDocumentPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const removeDocument = () => {
    setIdDocumentFile(null);
    setDocumentPreview(null);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  return (
    <div className="space-y-4" style={{ paddingBottom: '100px' }}>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/visitors')}
            size="large"
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Nuevo Visitante
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Registra un nuevo visitante en el sistema
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          <Card type="inner" title="Información Personal" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Nombre"
                  name="firstName"
                  rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Ingrese el nombre"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Apellido"
                  name="lastName"
                  rules={[{ required: true, message: 'El apellido es requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Ingrese el apellido"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card type="inner" title="Identificación" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Tipo de Identificación"
                  name="idType"
                  rules={[{ required: true, message: 'Seleccione el tipo de ID' }]}
                >
                  <Select placeholder="Seleccione" size="large">
                    <Option value="Cédula">Cédula</Option>
                    <Option value="Pasaporte">Pasaporte</Option>
                    <Option value="RUC">RUC</Option>
                    <Option value="Licencia">Licencia de Conducir</Option>
                    <Option value="Otro">Otro</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item
                  label="Número de Identificación"
                  name="idNumber"
                  rules={[
                    { required: true, message: 'El número de ID es requerido' },
                    { min: 5, message: 'Mínimo 5 caracteres' }
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Ingrese el número"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card type="inner" title="Información de Contacto" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Correo Electrónico"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Ingrese un email válido' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="ejemplo@correo.com"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Teléfono"
                  name="phone"
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="0999999999"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Empresa"
                  name="company"
                >
                  <Input
                    placeholder="Nombre de la empresa"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Dirección"
                  name="address"
                >
                  <Input
                    prefix={<HomeOutlined />}
                    placeholder="Ingrese la dirección"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Notas Adicionales"
              name="notes"
            >
              <TextArea
                rows={4}
                placeholder="Información adicional sobre el visitante (opcional)"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Card>

          <Card type="inner" title="Documentos" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Foto del Visitante">
                  {photoPreview ? (
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <Image
                          width="100%"
                          height={300}
                          src={photoPreview}
                          alt="Vista previa foto"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={removePhoto}
                          style={{ marginTop: '12px', width: '100%' }}
                          size="large"
                        >
                          Eliminar Foto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Upload
                      name="photo"
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      onChange={handlePhotoChange}
                      showUploadList={false}
                      style={{ width: '100%' }}
                    >
                      <div style={{ padding: '40px 20px' }}>
                        <CameraOutlined style={{ fontSize: 48, color: '#94a3b8' }} />
                        <div style={{ marginTop: 16, fontSize: 16 }}>
                          Subir Foto del Visitante
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                          Click para seleccionar
                        </div>
                      </div>
                    </Upload>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    Formatos: JPG, PNG. Máximo 5MB
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Documento de Identificación">
                  {documentPreview ? (
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <Image
                          width="100%"
                          height={300}
                          src={documentPreview}
                          alt="Vista previa documento"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={removeDocument}
                          style={{ marginTop: '12px', width: '100%' }}
                          size="large"
                        >
                          Eliminar Documento
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Upload
                      name="idDocument"
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      onChange={handleIdDocumentChange}
                      showUploadList={false}
                      style={{ width: '100%' }}
                    >
                      <div style={{ padding: '40px 20px' }}>
                        <UploadOutlined style={{ fontSize: 48, color: '#94a3b8' }} />
                        <div style={{ marginTop: 16, fontSize: 16 }}>
                          Subir Documento de ID
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                          Click para seleccionar
                        </div>
                      </div>
                    </Upload>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    Copia o foto del documento de identidad
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Card>

      {/* Footer fijo con botones de acción */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 280,
        right: 0,
        padding: '16px 32px',
        background: isDark 
          ? 'rgba(15, 23, 42, 0.98)' 
          : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
        boxShadow: isDark 
          ? '0 -4px 24px rgba(0, 0, 0, 0.4)' 
          : '0 -4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Space size="middle">
          <Button
            onClick={() => navigate('/visitors')}
            size="large"
            style={{
              minWidth: 120,
            }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            size="large"
            icon={<SaveOutlined />}
            style={{
              minWidth: 180,
            }}
          >
            Guardar Visitante
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default NewVisitor;