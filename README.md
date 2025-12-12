# Gestor de Usuarios para Eventos

Sistema web para gestionar usuarios y eventos, permitiendo registrar usuarios a múltiples eventos con sistema de autenticación seguro.

## Características

### 🔐 Sistema de Autenticación
- **Login seguro** con email y contraseña
- **Registro de usuarios** solo accesible desde dentro del sistema (requiere autenticación)
- **Usuario administrador inicial** para gestionar el sistema
- **Protección de rutas** - acceso restringido según permisos
- **Sesiones JWT** persistentes

### 👥 Gestión de Usuarios
- **ABM completo**: Crear, editar, eliminar e inhabilitar usuarios
- **Búsqueda avanzada** por nombre, apellido, documento o email
- **Estados activos/inactivos** sin eliminación física
- **Historial de eventos** por usuario

### 📅 Gestión de Eventos
- **ABM de Eventos**: Crear, editar, eliminar e inhabilitar eventos
- **Categorización**: Subsecretarías, Tipos y Subtipos
- **Registro de participantes** con validaciones
- **Búsqueda y filtrado** avanzado

### 📝 Registro de Usuarios a Eventos
- **Búsqueda rápida** de usuarios por documento
- **Visualización** de eventos anteriores del usuario
- **Registro inteligente** con validación de duplicados
- **Gestión de notas** por registro

## Tecnologías

### Backend
- Node.js
- Express.js
- MySQL
- Arquitectura MVC

### Frontend
- React
- Axios para peticiones HTTP
- CSS puro para estilos

## Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias del backend:**
```bash
npm install
```

3. **Instalar dependencias del frontend:**
```bash
cd client
npm install
cd ..
```

4. **Configurar la base de datos:**
   - Crear una base de datos MySQL llamada `gestor_eventos`
   - **Opción recomendada**: Ejecutar el script completo de inicialización:
```sql
mysql -u root -p < init-database.sql
```
   Este script crea todas las tablas, datos de ejemplo y el usuario administrador.

   - **Opción alternativa**: Si prefieres crear manualmente:
```sql
mysql -u root -p < database/schema.sql
```
   Luego crear el usuario admin con:
```bash
npm run create-admin
```

5. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env` (si existe)
   - O crear `.env` con tus credenciales de MySQL:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gestor_eventos
DB_PORT=3306
JWT_SECRET=tu_clave_secreta_para_jwt
```

## Ejecución

### ⚡ Inicio Rápido (Windows)

**Método más fácil:** Doble clic en `iniciar.bat` o ejecuta en PowerShell:
```powershell
npm run dev-all
```

Esto iniciará automáticamente el backend (puerto 5000) y el frontend (puerto 3000).

Luego abre tu navegador en: **http://localhost:3000**

#### 🔑 Primer Acceso
Después de la instalación, puedes acceder con las credenciales del administrador:

- **Email:** `admin@municipio.gob.ar`
- **Contraseña:** `Admin123!`

> ⚠️ **Importante:** Cambia la contraseña del administrador después del primer login por seguridad.

### Desarrollo Detallado

**Opción 1: Ejecutar ambos simultáneamente (Recomendado)**
```powershell
npm run dev-all
```

**Opción 2: Ejecutar por separado**

Terminal 1 - Backend:
```powershell
npm run dev
```

Terminal 2 - Frontend (abre otra terminal):
```powershell
npm run client
```

> 📖 **Para instrucciones más detalladas, consulta [GUIA_EJECUCION.md](GUIA_EJECUCION.md)**

### Producción

1. **Compilar el frontend:**
```bash
cd client
npm run build
cd ..
```

2. **Iniciar el servidor:**
```bash
npm start
```

## Estructura del Proyecto

```
gestor_usuarios_eventos/
├── config/
│   └── database.js          # Configuración de MySQL
├── controllers/
│   ├── UsuarioController.js
│   ├── EventoController.js
│   └── RegistroController.js
├── models/
│   ├── Usuario.js
│   ├── Evento.js
│   └── RegistroEvento.js
├── routes/
│   ├── usuarioRoutes.js
│   ├── eventoRoutes.js
│   └── registroRoutes.js
├── database/
│   └── schema.sql            # Script de creación de tablas
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── server.js                 # Punto de entrada del servidor
└── package.json
```

## API Endpoints

### 🔐 Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario (requiere autenticación)
- `GET /api/auth/verify` - Verificar token JWT
- `GET /api/auth/users` - Obtener todos los usuarios (solo admin)
- `PUT /api/auth/users/:id` - Actualizar usuario (solo admin o propio perfil)
- `DELETE /api/auth/users/:id` - Eliminar usuario (solo admin)
- `PATCH /api/auth/users/:id/toggle-activo` - Activar/desactivar usuario (solo admin)

### 👥 Usuarios (Vecinos)
- `GET /api/vecinos` - Obtener todos los vecinos
- `GET /api/vecinos/:id` - Obtener vecino por ID
- `GET /api/vecinos/por-documento/:documento` - Buscar vecino por documento
- `GET /api/vecinos/search?q=termino` - Buscar vecinos
- `GET /api/vecinos/:id/eventos` - Obtener eventos de un vecino
- `POST /api/vecinos` - Crear vecino
- `PUT /api/vecinos/:id` - Actualizar vecino
- `DELETE /api/vecinos/:id` - Eliminar vecino
- `PATCH /api/vecinos/:id/toggle-activo` - Habilitar/Inhabilitar vecino

### Eventos
- `GET /api/eventos` - Obtener todos los eventos
- `GET /api/eventos/activos` - Obtener eventos activos
- `GET /api/eventos/:id` - Obtener evento por ID
- `GET /api/eventos/:id/usuarios` - Obtener usuarios de un evento
- `POST /api/eventos` - Crear evento
- `PUT /api/eventos/:id` - Actualizar evento
- `DELETE /api/eventos/:id` - Eliminar evento
- `PATCH /api/eventos/:id/toggle-activo` - Habilitar/Inhabilitar evento

### Registros
- `GET /api/registros` - Obtener todos los registros
- `GET /api/registros/:id` - Obtener registro por ID
- `POST /api/registros` - Crear registro
- `POST /api/registros/por-documento` - Registrar usuario por documento
- `DELETE /api/registros/:id` - Eliminar registro

## Uso

### 🔐 Acceso al Sistema
1. **Iniciar Sesión**: Usa las credenciales del administrador para acceder por primera vez.
2. **Crear Usuarios**: Los administradores pueden crear nuevos usuarios desde dentro del sistema.
3. **Gestionar Permisos**: Los usuarios con rol 'admin' tienen acceso completo al sistema.

### 👥 Gestión de Vecinos
1. **Crear Vecinos**: Ve a la sección "Vecinos" y registra nuevos usuarios del sistema con sus datos personales.
2. **Buscar y Editar**: Utiliza la búsqueda en tiempo real para encontrar vecinos por nombre, apellido, documento o email.

### 📅 Gestión de Eventos
1. **Crear Eventos**: Ve a la sección "Eventos" y crea los eventos que necesites.
2. **Organizar por Categorías**: Asigna subsecretarías, tipos y subtipos a cada evento para mejor organización.

### 📝 Registro de Vecinos a Eventos
1. **Registro Rápido**:
   - Ve a la sección "Registro"
   - Ingresa el documento del vecino
   - El sistema mostrará si el vecino existe y sus eventos anteriores
   - Selecciona un evento y registra al vecino
2. **Validaciones Automáticas**: El sistema previene registros duplicados y verifica la existencia del vecino.

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración de 24 horas
- **Hash de Contraseñas**: Bcrypt para almacenamiento seguro de contraseñas
- **Protección de Rutas**: Middleware que verifica autenticación en todas las rutas protegidas
- **Roles y Permisos**: Sistema de roles (admin/user) para control de acceso
- **Validación de Datos**: Sanitización y validación de todas las entradas
- **HTTPS Recomendado**: Para producción, configura HTTPS en el servidor

## Notas

- El documento de vecino debe ser único
- Un vecino no puede estar registrado dos veces en el mismo evento
- Los vecinos y eventos pueden ser habilitados/inhabilitados sin eliminarlos
- La búsqueda de vecinos es en tiempo real mientras escribes
- Solo usuarios autenticados pueden acceder al sistema
- Los administradores pueden gestionar usuarios, pero no pueden eliminarse a sí mismos
- El registro de nuevos usuarios solo puede hacerse desde dentro del sistema (requiere login)

