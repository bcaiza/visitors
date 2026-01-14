# visitors

Sistema de Control de Visitantes - Aplicación web completa para gestión de acceso y registro de visitantes.

## 📋 Descripción

Sistema simple y eficiente para el control de visitantes que permite registrar entradas y salidas con información básica: nombre, apellidos, cédula, fecha y hora de entrada/salida.

## 🛠️ Stack Tecnológico

### Frontend
- **React** con **Vite**
- **Ant Design** - Componentes UI
- Context API para gestión de estado
- Modo oscuro/claro

### Backend
- **Node.js** + **Express**
- **Sequelize** ORM
- **PostgreSQL** - Base de datos
- JWT para autenticación

## ✨ Características

- ✅ Registro de visitantes (nombre, apellidos, cédula)
- ✅ Control de entradas y salidas con fecha y hora
- ✅ Sistema de autenticación y autorización
- ✅ Gestión de usuarios y roles
- ✅ Interfaz moderna con Ant Design
- ✅ Tema claro/oscuro
- ✅ Búsqueda y filtrado de visitantes
- ✅ Panel administrativo completo

## 📁 Estructura del Proyecto

```
visitors/
├── frontend-visitas/          # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── context/         # Context API (Auth, Theme)
│   │   └── services/        # Llamadas API
│   └── package.json
│
└── backend-visitas/          # API Node.js
    ├── src/
    │   ├── controllers/     # Lógica de negocio
    │   ├── models/          # Modelos Sequelize
    │   ├── routes/          # Rutas API
    │   ├── middleware/      # Autenticación, validación
    │   └── config/          # Configuración DB
    └── package.json
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Backend

```bash
cd backend-visitas
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
npm run migrate

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd frontend-visitas
npm install

# Iniciar aplicación
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno (.env)

**Backend:**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=visitors_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

**Frontend:**
```env
VITE_API_URL=http://localhost:4000/api
```

## 📊 Módulos del Sistema

### 👥 Visitantes
- Registro de visitantes
- Edición de información
- Búsqueda y filtrado
- Historial de visitas

### 🚪 Entradas/Salidas
- Registro de entrada
- Registro de salida
- Visitantes activos
- Reporte de accesos

### 👨‍💼 Usuarios
- Gestión de usuarios del sistema
- Asignación de roles
- Permisos por módulo

### 🔐 Roles y Permisos
- Creación de roles personalizados
- Asignación de permisos
- Control de acceso por módulo

## 🎨 Capturas de Pantalla

_[Aquí puedes agregar capturas de pantalla de tu aplicación]_

## 🔒 Seguridad

- Autenticación mediante JWT
- Passwords encriptados con bcrypt
- Validación de datos en backend
- Protección de rutas sensibles
- Control de permisos por rol

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Visitantes
- `GET /api/visitors` - Listar visitantes
- `POST /api/visitors` - Crear visitante
- `GET /api/visitors/:id` - Obtener visitante
- `PUT /api/visitors/:id` - Actualizar visitante
- `DELETE /api/visitors/:id` - Eliminar visitante

### Entradas/Salidas
- `GET /api/entries` - Listar entradas
- `POST /api/entries` - Registrar entrada
- `PUT /api/entries/:id` - Actualizar salida
- `GET /api/entries/active` - Visitantes activos

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Roles
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Puerto en uso
```bash
# Cambiar puerto en .env
PORT=4001

# O liberar el puerto
kill -9 $(lsof -t -i:4000)
```

### Errores de instalación
```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🚧 Desarrollo

```bash
# Backend
npm run dev          # Modo desarrollo
npm run start        # Producción
npm run migrate      # Ejecutar migraciones
npm run seed         # Datos de prueba

# Frontend
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run preview      # Preview build
```



