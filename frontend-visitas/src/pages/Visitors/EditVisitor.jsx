import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Spin,
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

const EditVisitor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [visitor, setVisitor] = useState(null);
  
  // Para nuevas fotos
  const [photoFile, setPhotoFile] = useState(null);
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  
  // Para fotos existentes
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);

  useEffect(() => {
    loadVisitor();
  }, [id]);

  const loadVisitor = async () => {
    try {
      setLoadingData(true);
      const visitorData = await visitorService.getById(id);
      
      setVisitor(visitorData);
      
      // Cargar datos en el formulario
      form.setFieldsValue({
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        idType: visitorData.idType,
        idNumber: visitorData.idNumber,
        email: visitorData.email,
        phone: visitorData.phone,
        company: visitorData.company,
        address: visitorData.address,
        notes: visitorData.notes,
      });

      // Establecer fotos actuales si existen
      if (visitorData.photoPath) {
        // Asumiendo que el backend devuelve la URL completa o path
        setCurrentPhoto(visitorData.photoPath);
      }
      
      if (visitorData.idDocumentPath) {
        setCurrentDocument(visitorData.idDocumentPath);
      }
      
    } catch (error) {
      message.error('Error al cargar los datos del visitante');
      console.error(error);
      navigate('/visitors');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const visitorData = {
        ...values,
        // Solo enviar nuevas fotos si fueron cambiadas
        photo: photoFile,
        idDocument: idDocumentFile,
      };

      await visitorService.update(id, visitorData);
      message.success('Visitante actualizado exitosamente');
      navigate('/visitors');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al actualizar visitante');
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
      
      // Preview de la nueva foto
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
        setCurrentPhoto(null); // Ocultar la foto actual
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdDocumentChange = (info) => {
    // Obtener el archivo - info.file puede ser el File directo o tener originFileObj
    const file = info.file.originFileObj || info.file;
    
    // Verificar que sea un archivo válido (Blob o File)
    if (file && (file instanceof File || file instanceof Blob)) {
      setIdDocumentFile(file);
      
      // Preview del nuevo documento
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreview(e.target.result);
        setCurrentDocument(null); // Ocultar el documento actual
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    // Restaurar foto actual si existe
    if (visitor?.photoPath) {
      setCurrentPhoto(visitor.photoPath);
    }
  };

  const removeCurrentPhoto = () => {
    setCurrentPhoto(null);
    // Aquí podrías agregar lógica para eliminar la foto en el servidor
  };

  const removeDocument = () => {
    setIdDocumentFile(null);
    setDocumentPreview(null);
    // Restaurar documento actual si existe
    if (visitor?.idDocumentPath) {
      setCurrentDocument(visitor.idDocumentPath);
    }
  };

  const removeCurrentDocument = () => {
    setCurrentDocument(null);
    // Aquí podrías agregar lógica para eliminar el documento en el servidor
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

  if (loadingData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Cargando datos del visitante..." />
      </div>
    );
  }

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
              Editar Visitante
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Modifica la información del visitante {visitor?.firstName} {visitor?.lastName}
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
                  {/* Mostrar nueva foto preview */}
                  {photoPreview ? (
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#10b981', 
                          marginBottom: 8,
                          fontWeight: 600 
                        }}>
                          ✓ Nueva foto seleccionada
                        </div>
                        <Image
                          width="100%"
                          height={300}
                          src={photoPreview}
                          alt="Nueva foto"
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
                          Cancelar cambio
                        </Button>
                      </div>
                    </div>
                  ) : currentPhoto ? (
                    /* Mostrar foto actual */
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#64748b', 
                          marginBottom: 8 
                        }}>
                          Foto actual
                        </div>
                        <Image
                          width="100%"
                          height={300}
                          src={`http://localhost:4000/${currentPhoto}`}
                          alt="Foto actual"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <Space style={{ marginTop: '12px', width: '100%' }} direction="vertical">
                          <Upload
                            name="photo"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            onChange={handlePhotoChange}
                            showUploadList={false}
                          >
                            <Button 
                              icon={<CameraOutlined />} 
                              style={{ width: '100%' }}
                              size="large"
                            >
                              Cambiar Foto
                            </Button>
                          </Upload>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={removeCurrentPhoto}
                            style={{ width: '100%' }}
                            size="large"
                          >
                            Eliminar Foto
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ) : (
                    /* No hay foto */
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
                  {/* Mostrar nuevo documento preview */}
                  {documentPreview ? (
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#10b981', 
                          marginBottom: 8,
                          fontWeight: 600 
                        }}>
                          ✓ Nuevo documento seleccionado
                        </div>
                        <Image
                          width="100%"
                          height={300}
                          src={documentPreview}
                          alt="Nuevo documento"
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
                          Cancelar cambio
                        </Button>
                      </div>
                    </div>
                  ) : currentDocument ? (
                    /* Mostrar documento actual */
                    <div className="relative">
                      <div style={{
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        background: isDark ? '#1e293b' : '#f8fafc',
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#64748b', 
                          marginBottom: 8 
                        }}>
                          Documento actual
                        </div>
                        <Image
                          width="100%"
                          height={300}
                          src={`http://localhost:4000/${currentDocument}`}
                          alt="Documento actual"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <Space style={{ marginTop: '12px', width: '100%' }} direction="vertical">
                          <Upload
                            name="idDocument"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            onChange={handleIdDocumentChange}
                            showUploadList={false}
                          >
                            <Button 
                              icon={<UploadOutlined />} 
                              style={{ width: '100%' }}
                              size="large"
                            >
                              Cambiar Documento
                            </Button>
                          </Upload>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={removeCurrentDocument}
                            style={{ width: '100%' }}
                            size="large"
                          >
                            Eliminar Documento
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ) : (
                    /* No hay documento */
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
            Guardar Cambios
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EditVisitor;