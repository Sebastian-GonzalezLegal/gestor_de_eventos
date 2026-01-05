const db = require('../config/database');

class Evento {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query(`
        SELECT e.*,
               s.nombre as subsecretaria_nombre,
               t.nombre as tipo_nombre,
               st.nombre as subtipo_nombre
        FROM eventos e
        LEFT JOIN subsecretarias s ON e.subsecretaria_id = s.id
        LEFT JOIN tipos t ON e.tipo_id = t.id
        LEFT JOIN subtipos st ON e.subtipo_id = st.id
        ORDER BY e.fecha_evento DESC
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query(`
        SELECT e.*,
               s.nombre as subsecretaria_nombre,
               t.nombre as tipo_nombre,
               st.nombre as subtipo_nombre
        FROM eventos e
        LEFT JOIN subsecretarias s ON e.subsecretaria_id = s.id
        LEFT JOIN tipos t ON e.tipo_id = t.id
        LEFT JOIN subtipos st ON e.subtipo_id = st.id
        WHERE e.id = ?
      `, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findActive() {
    return new Promise((resolve, reject) => {
      db.query(`
        SELECT e.*,
               s.nombre as subsecretaria_nombre,
               t.nombre as tipo_nombre,
               st.nombre as subtipo_nombre
        FROM eventos e
        LEFT JOIN subsecretarias s ON e.subsecretaria_id = s.id
        LEFT JOIN tipos t ON e.tipo_id = t.id
        LEFT JOIN subtipos st ON e.subtipo_id = st.id
        WHERE e.activo = TRUE
        ORDER BY e.fecha_evento DESC
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async create(eventoData) {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = eventoData;
      db.query(
        'INSERT INTO eventos (nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion || null, fecha_evento, hora_evento || null, lugar || null, subsecretaria_id || null, tipo_id || null, subtipo_id || null],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...eventoData });
        }
      );
    });
  }

  static async update(id, eventoData) {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = eventoData;
      db.query(
        'UPDATE eventos SET nombre = ?, descripcion = ?, fecha_evento = ?, hora_evento = ?, lugar = ?, subsecretaria_id = ?, tipo_id = ?, subtipo_id = ? WHERE id = ?',
        [nombre, descripcion || null, fecha_evento, hora_evento || null, lugar || null, subsecretaria_id || null, tipo_id || null, subtipo_id || null, id],
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

  static async disableExpired() {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE eventos SET activo = FALSE WHERE activo = TRUE AND (fecha_evento < CURDATE() OR (fecha_evento = CURDATE() AND hora_evento < CURTIME()))',
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  static async getVecinosByEvento(eventoId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT v.*, re.fecha_registro, re.notas
         FROM vecinos v
         INNER JOIN registros_eventos re ON v.id = re.vecino_id
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

