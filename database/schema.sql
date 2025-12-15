-- Crear base de datos
CREATE DATABASE IF NOT EXISTS gestor_eventos;
USE gestor_eventos;

-- Tabla de vecinos
CREATE TABLE IF NOT EXISTS vecinos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  telefono VARCHAR(20),
  documento VARCHAR(50) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  calle VARCHAR(200),
  altura VARCHAR(50),
  piso VARCHAR(50),
  departamento VARCHAR(50),
  entre_calle_1 VARCHAR(200),
  entre_calle_2 VARCHAR(200),
  barrio_id INT,
  localidad_id INT,
  otra_localidad VARCHAR(200),
  celular VARCHAR(50),
  genero_id INT,
  estudio_id INT,
  ocupacion VARCHAR(200),
  nacionalidad VARCHAR(100),
  estado_civil_id INT,
  barrio_especificacion VARCHAR(200),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documento (documento),
  INDEX idx_email (email)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_evento DATE NOT NULL,
  hora_evento TIME,
  lugar VARCHAR(200),
  subsecretaria_id INT,
  tipo_id INT,
  subtipo_id INT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id) ON DELETE SET NULL,
  FOREIGN KEY (tipo_id) REFERENCES tipos(id) ON DELETE SET NULL,
  FOREIGN KEY (subtipo_id) REFERENCES subtipos(id) ON DELETE SET NULL,
  INDEX idx_fecha (fecha_evento),
  INDEX idx_subsecretaria (subsecretaria_id),
  INDEX idx_tipo (tipo_id),
  INDEX idx_subtipo (subtipo_id)
);

-- Tabla de registros (relación muchos a muchos entre vecinos y eventos)
CREATE TABLE IF NOT EXISTS registros_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vecino_id INT NOT NULL,
  evento_id INT NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,
  FOREIGN KEY (vecino_id) REFERENCES vecinos(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vecino_evento (vecino_id, evento_id),
  INDEX idx_vecino (vecino_id),
  INDEX idx_evento (evento_id)
);

-- Tabla de subsecretarias
CREATE TABLE IF NOT EXISTS subsecretarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- Tabla de tipos
CREATE TABLE IF NOT EXISTS tipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
);

-- Tabla de subtipos
CREATE TABLE IF NOT EXISTS subtipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo_id INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_id) REFERENCES tipos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_subtipo_tipo (nombre, tipo_id),
  INDEX idx_tipo (tipo_id),
  INDEX idx_nombre (nombre)
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'user', 'visitante') DEFAULT 'user',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

