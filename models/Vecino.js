const db = require('../config/database');

class Vecino {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM vecinos ORDER BY fecha_creacion DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM vecinos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findByDocumento(documento) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM vecinos WHERE documento = ?', [documento], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM vecinos WHERE email = ?', [email], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async search(searchTerm) {
    return new Promise((resolve, reject) => {
      const search = `%${searchTerm}%`;
      db.query(
        `SELECT * FROM vecinos
         WHERE (nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? OR email LIKE ?)
         AND activo = TRUE
         ORDER BY nombre, apellido`,
        [search, search, search, search],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  static async create(vecinoData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, email, telefono, documento } = vecinoData;
      db.query(
        'INSERT INTO vecinos (nombre, apellido, email, telefono, documento) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, email || null, telefono || null, documento],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...vecinoData });
        }
      );
    });
  }

  static async update(id, vecinoData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, email, telefono, documento } = vecinoData;
      db.query(
        'UPDATE vecinos SET nombre = ?, apellido = ?, email = ?, telefono = ?, documento = ? WHERE id = ?',
        [nombre, apellido, email || null, telefono || null, documento, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...vecinoData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM vecinos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async toggleActivo(id) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE vecinos SET activo = NOT activo WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else {
          db.query('SELECT * FROM vecinos WHERE id = ?', [id], (err2, results2) => {
            if (err2) reject(err2);
            else resolve(results2[0]);
          });
        }
      });
    });
  }

  static async getEventosByVecino(vecinoId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, re.fecha_registro, re.notas
         FROM eventos e
         INNER JOIN registros_eventos re ON e.id = re.evento_id
         WHERE re.vecino_id = ?
         ORDER BY e.fecha_evento DESC`,
        [vecinoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = Vecino;