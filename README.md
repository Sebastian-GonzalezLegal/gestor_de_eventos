# Gestor de Usuarios para Eventos

Sistema web para gestionar usuarios y eventos, permitiendo registrar usuarios a múltiples eventos.

## Características

- **ABM de Usuarios**: Crear, editar, eliminar e inhabilitar usuarios
- **ABM de Eventos**: Crear, editar, eliminar e inhabilitar eventos
- **Registro de Usuarios a Eventos**: 
  - Búsqueda de usuarios por documento
  - Visualización de eventos anteriores del usuario
  - Registro a nuevos eventos
  - Validación para evitar registros duplicados

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
   - Crear una base de datos MySQL
   - Ejecutar el script `database/schema.sql` para crear las tablas
   - O ejecutar manualmente:
```sql
mysql -u root -p < database/schema.sql
```

5. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env`
   - Editar `.env` con tus credenciales de MySQL:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gestor_eventos
DB_PORT=3306
```

## Ejecución

### ⚡ Inicio Rápido (Windows)

**Método más fácil:** Doble clic en `iniciar.bat` o ejecuta en PowerShell:
```powershell
npm run dev-all
```

Esto iniciará automáticamente el backend (puerto 5000) y el frontend (puerto 3000).

Luego abre tu navegador en: **http://localhost:3000**

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

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `GET /api/usuarios/por-documento/:documento` - Buscar usuario por documento
- `GET /api/usuarios/search?q=termino` - Buscar usuarios
- `GET /api/usuarios/:id/eventos` - Obtener eventos de un usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `PATCH /api/usuarios/:id/toggle-activo` - Habilitar/Inhabilitar usuario

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

1. **Registrar Usuarios**: Ve a la sección "Usuarios" y crea nuevos usuarios con sus datos.

2. **Crear Eventos**: Ve a la sección "Eventos" y crea los eventos que necesites.

3. **Registrar Usuarios a Eventos**: 
   - Ve a la sección "Registro"
   - Ingresa el documento del usuario
   - El sistema mostrará si el usuario existe y sus eventos anteriores
   - Selecciona un evento y registra al usuario

## Notas

- El documento de usuario debe ser único
- Un usuario no puede estar registrado dos veces en el mismo evento
- Los usuarios y eventos pueden ser habilitados/inhabilitados sin eliminarlos
- La búsqueda de usuarios es en tiempo real mientras escribes

