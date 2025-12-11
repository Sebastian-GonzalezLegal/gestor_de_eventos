const db = require('../config/database');

class Evento {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM eventos ORDER BY fecha_evento DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM eventos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findActive() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM eventos WHERE activo = TRUE ORDER BY fecha_evento DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async create(eventoData) {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, fecha_evento, hora_evento, lugar } = eventoData;
      db.query(
        'INSERT INTO eventos (nombre, descripcion, fecha_evento, hora_evento, lugar) VALUES (?, ?, ?, ?, ?)',
        [nombre, descripcion || null, fecha_evento, hora_evento || null, lugar || null],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...eventoData });
        }
      );
    });
  }

  static async update(id, eventoData) {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, fecha_evento, hora_evento, lugar } = eventoData;
      db.query(
        'UPDATE eventos SET nombre = ?, descripcion = ?, fecha_evento = ?, hora_evento = ?, lugar = ? WHERE id = ?',
        [nombre, descripcion || null, fecha_evento, hora_evento || null, lugar || null, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...eventoData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM eventos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async toggleActivo(id) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE eventos SET activo = NOT activo WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else {
          db.query('SELECT * FROM eventos WHERE id = ?', [id], (err2, results2) => {
            if (err2) reject(err2);
            else resolve(results2[0]);
          });
        }
      });
    });
  }

  static async getUsuariosByEvento(eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT u.*, re.fecha_registro, re.notas 
         FROM usuarios u
         INNER JOIN registros_eventos re ON u.id = re.usuario_id
         WHERE re.evento_id = ?
         ORDER BY re.fecha_registro DESC`,
        [eventoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = Evento;

