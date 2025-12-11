const db = require('../config/database');

class RegistroEvento {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT re.*, u.nombre, u.apellido, u.documento, e.nombre as evento_nombre, e.fecha_evento
         FROM registros_eventos re
         INNER JOIN usuarios u ON re.usuario_id = u.id
         INNER JOIN eventos e ON re.evento_id = e.id
         ORDER BY re.fecha_registro DESC`,
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT re.*, u.nombre, u.apellido, u.documento, e.nombre as evento_nombre
         FROM registros_eventos re
         INNER JOIN usuarios u ON re.usuario_id = u.id
         INNER JOIN eventos e ON re.evento_id = e.id
         WHERE re.id = ?`,
        [id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }

  static async findByUsuarioAndEvento(usuarioId, eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM registros_eventos WHERE usuario_id = ? AND evento_id = ?',
        [usuarioId, eventoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }

  static async create(registroData) {
    return new Promise((resolve, reject) => {
      const { usuario_id, evento_id, notas } = registroData;
      
      // Verificar si ya existe el registro
      this.findByUsuarioAndEvento(usuario_id, evento_id)
        .then(existing => {
          if (existing) {
            reject(new Error('El usuario ya está registrado en este evento'));
            return;
          }
          
          db.query(
            'INSERT INTO registros_eventos (usuario_id, evento_id, notas) VALUES (?, ?, ?)',
            [usuario_id, evento_id, notas || null],
            (err, results) => {
              if (err) reject(err);
              else resolve({ id: results.insertId, ...registroData });
            }
          );
        })
        .catch(reject);
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM registros_eventos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async deleteByUsuarioAndEvento(usuarioId, eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM registros_eventos WHERE usuario_id = ? AND evento_id = ?',
        [usuarioId, eventoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = RegistroEvento;

