const db = require('../config/database');

function fixForeignKeys() {
  return new Promise((resolve, reject) => {
    console.log('Verificando y corrigiendo claves foráneas...');
    
    // Primero intentamos eliminar la restricción incorrecta (o existente)
    const dropQuery = "ALTER TABLE registros_eventos DROP FOREIGN KEY registros_eventos_ibfk_1";
    
    db.query(dropQuery, (err, result) => {
      // Ignoramos error 1091 (Can't DROP '...'; check that column/key exists)
      if (err && err.errno !== 1091) {
        console.log('Nota: La restricción registros_eventos_ibfk_1 no existía o no se pudo borrar (esto es normal si ya se corrigió o tiene otro nombre). Error:', err.message);
      } else {
        console.log('Restricción anterior eliminada (si existía).');
      }

      // Ahora recreamos la restricción apuntando a la tabla correcta 'vecinos'
      const addQuery = `
        ALTER TABLE registros_eventos 
        ADD CONSTRAINT registros_eventos_ibfk_1 
        FOREIGN KEY (vecino_id) REFERENCES vecinos(id) ON DELETE CASCADE
      `;

      db.query(addQuery, (err, result) => {
        if (err) {
          // Si falla porque ya existe (duplicate), está bien. 
          // Si falla por otra cosa, lo logueamos.
          if (err.errno === 1061 || err.errno === 1005) { // Duplicate key name or Can't create
             console.log('Nota al crear FK: ', err.message);
          } else {
             console.error('Error crítico al intentar crear la FK correcta:', err);
          }
        } else {
          console.log('✅ Clave foránea registros_eventos_ibfk_1 corregida correctamente (referencia a tabla `vecinos`).');
        }
        
        // Resolvemos siempre para no detener el servidor
        resolve();
      });
    });
  });
}

module.exports = fixForeignKeys;
