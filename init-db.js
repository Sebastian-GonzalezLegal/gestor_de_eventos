require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  let connection;

  try {
    console.log('Conectando a MySQL...');

    // Conectar sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a MySQL');

    // Crear base de datos
    await connection.query('CREATE DATABASE IF NOT EXISTS gestor_eventos');
    console.log('✅ Base de datos creada');

    // Usar la base de datos
    await connection.query('USE gestor_eventos');

    // Leer y ejecutar el script SQL
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('Ejecutando script de inicialización...');

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Ignorar errores de tablas que ya existen
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate entry')) {
            console.warn('⚠️  Error en statement:', statement.substring(0, 100) + '...');
            console.warn('Error:', error.message);
          }
        }
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('\n🔑 Credenciales de administrador:');
    console.log('Email: admin@municipio.gob.ar');
    console.log('Contraseña: Admin123!');

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
