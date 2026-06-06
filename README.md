<div align="center">

# 🔥 GasConnect

### Sistema Web para la Gestión Logística de Gas a Domicilio

![Version](https://img.shields.io/badge/versión-1.0--Sprint%201-orange?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/licencia-MIT-yellow?style=for-the-badge)

> Plataforma web full-stack que conecta a clientes con distribuidores de gas en la ciudad de **Quito, Ecuador**, permitiendo solicitar, gestionar y hacer seguimiento de pedidos de gas a domicilio de forma rápida y segura.
</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Características del Sprint 1](#-características-del-sprint-1)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API REST — Endpoints](#-api-rest--endpoints)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Autores](#-autores)

---

## 📖 Descripción General

**GasConnect** es un sistema web orientado a la gestión integral del servicio logístico de entrega de gas a domicilio en Quito. La plataforma contempla tres roles diferenciados:

| Rol | Descripción |
|-----|-------------|
| 🧑‍💼 **Administrador** | Gestiona usuarios, visualiza todos los pedidos y actualiza estados |
| 🚚 **Repartidor** | Accede a los pedidos asignados y actualiza su estado de entrega |
| 👤 **Cliente** | Se registra, solicita cilindros de gas y hace seguimiento de sus pedidos |

---

## 🚦 Estado del Proyecto

```
Sprint 1 — En desarrollo activo
```

Este repositorio corresponde al **Sprint 1** del ciclo de desarrollo. Las funcionalidades cubiertas hasta la fecha son las descritas en la sección siguiente. Sprints posteriores expandirán el módulo de pagos (Stripe), notificaciones en tiempo real (Socket.io), gestión de imágenes (Cloudinary) y más.

---

## ✅ Características del Sprint 1

### 🔐 Autenticación y Gestión de Usuarios
- Registro de usuarios con roles (`administrador`, `repartidor`, `cliente`)
- Inicio de sesión con **JWT** (token con expiración de 30 días)
- **Confirmación de correo electrónico** vía token seguro (SHA-256) con expiración de 24 h
- Reenvío de correo de confirmación desde el dashboard
- **Recuperación de contraseña** por correo electrónico (forgot/reset password)
- Consulta y edición de perfil autenticado
- Eliminación de cuenta propia
- Listado de usuarios (solo administrador)
- Contraseñas encriptadas con **bcryptjs** (salt 10)
- Correos transaccionales en HTML responsivo con plantilla de marca GasConnect

### 📦 Gestión de Pedidos
- Creación de pedidos de cilindros de gas (solo clientes)
- Consulta de pedidos según rol del usuario
- Actualización de estado del pedido: `pendiente` → `en camino` → `entregado` / `cancelado` (administrador y repartidor)
- Campos: dirección de entrega, cantidad de cilindros, total, repartidor asignado, fecha de entrega

### 🌐 Frontend — Páginas y Componentes
- **Landing page** con animaciones AOS, hero section, servicios y galería
- **Login / Registro** con validación mediante `react-hook-form`
- **Confirmación de email** con flujo de token por URL
- **Forgot Password / Reset Password**
- **Dashboard** dinámico por rol (perfil, pedidos, gestión de usuarios)
- **CRUD de pedidos** (crear y listar)
- Rutas protegidas y rutas públicas con React Router v7
- Notificaciones con **react-toastify**
- Estado global con **Zustand**
- Instalable como **PWA** (Progressive Web App)

---

## 🏗️ Arquitectura del Sistema

```
GasConnect
├── Backend (API REST)
│   ├── Node.js + Express
│   ├── MongoDB Atlas (Mongoose)
│   ├── Autenticación JWT
│   ├── Nodemailer (SMTP Gmail)
│   └── Helmet + CORS (seguridad)
│
└── Frontend (SPA + PWA)
    ├── React 19 + Vite 6
    ├── React Router v7
    ├── Zustand (estado global)
    ├── Axios (HTTP client)
    └── Tailwind CSS + CSS Modules
```

### Flujo de comunicación

```
Cliente (Browser / PWA)
        │
        │  HTTP / JSON  (Axios)
        ▼
   API REST  →  /api/auth/*
   (Express)  →  /api/orders/*
        │
        │  Mongoose ODM
        ▼
   MongoDB Atlas
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | LTS | Runtime |
| Express | ^4.22 | Framework HTTP |
| Mongoose | ^8.24 | ODM para MongoDB |
| JSON Web Token | ^9.0 | Autenticación |
| bcryptjs | ^2.4 | Hash de contraseñas |
| Nodemailer | ^8.0 | Envío de correos |
| Helmet | ^7.1 | Seguridad HTTP |
| dotenv | ^16.6 | Variables de entorno |
| Socket.io | ^4.8 | Tiempo real *(próxima iteración)* |
| Stripe | ^22.1 | Pagos *(próxima iteración)* |
| Cloudinary | ^2.10 | Imágenes *(próxima iteración)* |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | ^19.1 | UI Library |
| Vite | ^6.3 | Build tool |
| React Router DOM | ^6.30 | Navegación |
| Zustand | ^5.0 | Estado global |
| Axios | ^1.16 | Peticiones HTTP |
| react-hook-form | ^7.76 | Formularios |
| react-toastify | ^11.1 | Notificaciones |
| AOS | ^2.3 | Animaciones scroll |
| Swiper | ^12.0 | Carrusel |
| vite-plugin-pwa | ^1.2 | PWA support |
| Tailwind CSS | — | Estilos utilitarios |

---

## 📁 Estructura del Proyecto

```
GasConnect_1.0/
│
├── Backend/
│   ├── app.js                  # Entrada principal del servidor
│   ├── .env                    # Variables de entorno (no se sube al repo)
│   ├── config/
│   │   └── db.js               # Conexión a MongoDB (con fallback)
│   ├── controllers/
│   │   ├── authController.js   # Registro, login, perfil, contraseña, email
│   │   └── orderController.js  # CRUD de pedidos
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect + authorize por rol
│   ├── models/
│   │   ├── User.js             # Schema de usuario con roles
│   │   └── Order.js            # Schema de pedido con estados
│   ├── routes/
│   │   ├── authRoutes.js       # Rutas de autenticación
│   │   └── orderRoutes.js      # Rutas de pedidos
│   └── utils/
│       └── sendEmail.js        # Helper Nodemailer
│
└── frontend/
    ├── index.html
    ├── vite.config.js          # Config Vite + PWA
    ├── src/
    │   ├── App.jsx             # Rutas principales
    │   ├── main.jsx
    │   ├── api/
    │   │   └── axios.js        # Instancia Axios con baseURL
    │   ├── context/
    │   │   ├── storeAuth.jsx   # Store Zustand (token, rol)
    │   │   └── storeProfile.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ConfirmEmail.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   └── NotFound.jsx
    │   ├── components/
    │   │   ├── crud/           # Crear y listar pedidos
    │   │   ├── header/
    │   │   ├── hero/
    │   │   ├── services/
    │   │   ├── gallery/
    │   │   ├── footer/
    │   │   ├── profile/        # Tarjetas de perfil y contraseña
    │   │   └── treatments/     # Modal de pedidos y pagos
    │   ├── routes/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── PublicRoute.jsx
    │   └── hooks/
    │       └── useFetch.js
    └── public/
        ├── icons/              # Iconos PWA (192x192, 512x512)
        └── manifest.json
```

---

## 🔌 API REST — Endpoints

### Autenticación — `/api/auth`

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| `POST` | `/register` | ❌ | — | Registro de nuevo usuario |
| `POST` | `/login` | ❌ | — | Inicio de sesión, retorna JWT |
| `POST` | `/confirm` | ❌ | — | Confirmar email con token |
| `GET` | `/confirm/:token` | ❌ | — | Confirmar email por URL |
| `POST` | `/forgotpassword` | ❌ | — | Enviar correo de recuperación |
| `PUT` | `/resetpassword` | ❌ | — | Restablecer contraseña |
| `GET` | `/profile` | ✅ | Todos | Obtener perfil propio |
| `DELETE` | `/profile` | ✅ | Todos | Eliminar cuenta propia |
| `POST` | `/resend-confirmation` | ✅ | Todos | Reenviar correo de confirmación |
| `GET` | `/users` | ✅ | Administrador | Listar todos los usuarios |

### Pedidos — `/api/orders`

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| `POST` | `/` | ✅ | Cliente | Crear nuevo pedido |
| `GET` | `/` | ✅ | Todos | Listar pedidos (filtrado por rol) |
| `PUT` | `/:id` | ✅ | Admin / Repartidor | Actualizar estado del pedido |

---

## ⚙️ Instalación y Configuración

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB Atlas](https://www.mongodb.com/atlas) (cuenta gratuita)
- Cuenta Gmail con contraseña de aplicación habilitada (para el correo SMTP)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/GasConnect_1.0.git
cd GasConnect_1.0
```

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crea el archivo `.env` en la carpeta `Backend/` (ver sección [Variables de Entorno](#-variables-de-entorno)).

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor quedará disponible en `http://localhost:3000`.

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

El cliente quedará disponible en `http://localhost:5173`.

---

## 🔑 Variables de Entorno

Crea el archivo `Backend/.env` con la siguiente estructura:

```env
# Servidor
PORT=3000
# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>?appName=<appName>
MONGODB_URI_FALLBACK=mongodb://<usuario>:<password>@<host>:27017,...
# Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura
# SMTP (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` al repositorio. Asegúrate de que esté incluido en tu `.gitignore`.
---

## 👥 Autores

<table>
  <tr>
    <td align="center">
      <b>Said Quinto Nevarez</b><br/>
      <sub>Rol / Scrum Master</sub>
    </td>
    <td align="center">
      <b>Marcos Araya</b><br/>
      <sub>Rol / Scrum Developer</sub>
    </td>
  </tr>
</table>

> Proyecto desarrollado en el contexto académico de la **Escuela Politécnica Nacional** · Quito, Ecuador · 2026.
---

<div align="center">

**GasConnect** © 2026 · Escuela Politécnica Nacional · Quito, Ecuador

</div>
