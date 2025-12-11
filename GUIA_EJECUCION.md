# Guía de Ejecución - Paso a Paso

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
1. **Node.js** (versión 14 o superior) - [Descargar aquí](https://nodejs.org/)
2. **XAMPP** (o MySQL) - Si ya tienes XAMPP, ¡perfecto! No necesitas instalar nada más.

Para verificar que los tienes instalados, abre PowerShell y ejecuta:
```powershell
node --version
```

**Si usas XAMPP:** Solo asegúrate de que el servicio MySQL esté corriendo desde el panel de control de XAMPP.

---

## 🚀 Pasos para Ejecutar el Proyecto

### PASO 1: Instalar Dependencias del Backend

Abre PowerShell en la carpeta del proyecto (`gestor_usuarios_eventos`) y ejecuta:

```powershell
npm install
```

Esto instalará todas las dependencias necesarias para el servidor (Express, MySQL, etc.)

---

### PASO 2: Instalar Dependencias del Frontend

En la misma terminal, ejecuta:

```powershell
cd client
npm install
cd ..
```

Esto instalará todas las dependencias de React.

---

### PASO 3: Configurar la Base de Datos MySQL

#### 3.1. Iniciar MySQL en XAMPP

1. Abre el **Panel de Control de XAMPP**
2. Haz clic en **Start** en el módulo **MySQL**
3. Verifica que el estado sea verde (corriendo)

#### 3.2. Crear la Base de Datos

Abre **phpMyAdmin** (desde XAMPP: http://localhost/phpmyadmin) y ejecuta:

```sql
CREATE DATABASE gestor_eventos;
```

O desde la pestaña "SQL" en phpMyAdmin, escribe:
```sql
CREATE DATABASE gestor_eventos;
```

#### 3.3. Crear las Tablas

**Opción A: Desde phpMyAdmin (Recomendado para XAMPP)**
1. Selecciona la base de datos `gestor_eventos` en el menú lateral
2. Ve a la pestaña **"SQL"**
3. Abre el archivo `database/schema.sql` con un editor de texto
4. Copia TODO el contenido del archivo
5. Pégalo en el área de texto de phpMyAdmin
6. Haz clic en **"Continuar"** o **"Ejecutar"**

**Opción B: Desde la línea de comandos**
```powershell
cd C:\xampp\mysql\bin
mysql.exe -u root gestor_eventos < "C:\Users\sebas\Desktop\gestor_usuarios_eventos\database\schema.sql"
```

> **Nota:** Si tienes contraseña en MySQL, agrega `-p` al comando y te la pedirá.

---

### PASO 4: Configurar Variables de Entorno

1. En la carpeta raíz del proyecto, crea un archivo llamado `.env`
2. Copia el contenido de `.env.example` o crea el archivo con este contenido:

**Si usas XAMPP (configuración por defecto - sin contraseña):**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestor_eventos
DB_PORT=3306
```

**Si configuraste una contraseña en MySQL:**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=gestor_eventos
DB_PORT=3306
```

**⚠️ IMPORTANTE:** 
- Si XAMPP está en su configuración por defecto, deja `DB_PASSWORD=` vacío
- Si configuraste una contraseña para MySQL, ponla en `DB_PASSWORD`

---

### PASO 5: Ejecutar la Aplicación

Tienes dos opciones:

#### **Opción A: Ejecutar Todo Junto (Recomendado para desarrollo)**

En una sola terminal, ejecuta:

```powershell
npm run dev-all
```

Esto iniciará tanto el servidor backend como el frontend React automáticamente.

#### **Opción B: Ejecutar por Separado**

**Terminal 1 - Backend:**
```powershell
npm run dev
```

**Terminal 2 - Frontend (abre otra terminal PowerShell):**
```powershell
npm run client
```

---

### PASO 6: Abrir en el Navegador

Una vez que ambos servidores estén corriendo, verás mensajes como:

- Backend: `Servidor corriendo en puerto 5000`
- Frontend: `Compiled successfully!` y una URL como `http://localhost:3000`

**Abre tu navegador y ve a:** `http://localhost:3000`

---

## 🎯 ¿Qué Deberías Ver?

1. **Página principal** con tres pestañas:
   - **Registro**: Para registrar usuarios a eventos
   - **Usuarios**: Para gestionar usuarios
   - **Eventos**: Para gestionar eventos

2. **Si hay errores**, revisa:
   - Que MySQL esté corriendo
   - Que las credenciales en `.env` sean correctas
   - Que la base de datos y tablas estén creadas

---

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module"
**Solución:** Ejecuta `npm install` en la carpeta raíz y luego `npm install` en la carpeta `client`

### Error: "Access denied for user"
**Solución:** 
- Si usas XAMPP, normalmente no hay contraseña. Deja `DB_PASSWORD=` vacío en el archivo `.env`
- Si configuraste una contraseña, asegúrate de que sea la correcta en `.env`
- Verifica que el usuario sea `root` (por defecto en XAMPP)

### Error: "Database doesn't exist"
**Solución:** Asegúrate de haber creado la base de datos `gestor_eventos` y ejecutado el script `schema.sql`

### El frontend no se conecta al backend
**Solución:** Verifica que ambos servidores estén corriendo:
- Backend en puerto 5000
- Frontend en puerto 3000

---

## 📝 Comandos Útiles

```powershell
# Verificar que Node.js está instalado
node --version

# Verificar que npm está instalado
npm --version

# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd client
npm install
cd ..

# Ejecutar todo junto
npm run dev-all

# Ejecutar solo backend
npm run dev

# Ejecutar solo frontend
npm run client
```

---

## ✅ Checklist Antes de Ejecutar

- [ ] Node.js instalado
- [ ] XAMPP instalado y MySQL corriendo (botón Start en verde)
- [ ] Base de datos `gestor_eventos` creada en phpMyAdmin
- [ ] Tablas creadas (ejecutado `schema.sql` en phpMyAdmin)
- [ ] Archivo `.env` creado con las credenciales correctas
  - Si XAMPP sin contraseña: `DB_PASSWORD=` (vacío)
  - Si tienes contraseña: `DB_PASSWORD=tu_contraseña`
- [ ] Dependencias del backend instaladas (`npm install`)
- [ ] Dependencias del frontend instaladas (`cd client && npm install`)

---

¡Listo! Si sigues estos pasos, deberías poder ejecutar la aplicación sin problemas. 🎉

