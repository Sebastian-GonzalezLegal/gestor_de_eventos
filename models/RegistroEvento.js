const db = require('../config/database');

class RegistroEvento {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT re.*, v.nombre, v.apellido, v.documento, e.nombre as evento_nombre, e.fecha_evento
         FROM registros_eventos re
         INNER JOIN vecinos v ON re.vecino_id = v.id
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
        `SELECT re.*, v.nombre, v.apellido, v.documento, e.nombre as evento_nombre
         FROM registros_eventos re
         INNER JOIN vecinos v ON re.vecino_id = v.id
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

  static async findByVecinoAndEvento(vecinoId, eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM registros_eventos WHERE vecino_id = ? AND evento_id = ?',
        [vecinoId, eventoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }

  static async create(registroData) {
    return new Promise((resolve, reject) => {
      const { vecino_id, evento_id, notas } = registroData;

      // Verificar si ya existe el registro
      this.findByVecinoAndEvento(vecino_id, evento_id)
        .then(existing => {
          if (existing) {
            reject(new Error('El vecino ya está registrado en este evento'));
            return;
          }

          db.query(
            'INSERT INTO registros_eventos (vecino_id, evento_id, notas) VALUES (?, ?, ?)',
            [vecino_id, evento_id, notas || null],
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

  static async deleteByVecinoAndEvento(vecinoId, eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM registros_eventos WHERE vecino_id = ? AND evento_id = ?',
        [vecinoId, eventoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = RegistroEvento;

