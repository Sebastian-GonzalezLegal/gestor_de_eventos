const db = require('../config/database');

class Usuario {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios ORDER BY fecha_creacion DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findByDocumento(documento) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios WHERE documento = ?', [documento], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async search(searchTerm) {
    return new Promise((resolve, reject) => {
      const search = `%${searchTerm}%`;
      db.query(
        `SELECT * FROM usuarios 
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

  static async create(usuarioData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, email, telefono, documento } = usuarioData;
      db.query(
        'INSERT INTO usuarios (nombre, apellido, email, telefono, documento) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, email || null, telefono || null, documento],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...usuarioData });
        }
      );
    });
  }

  static async update(id, usuarioData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, email, telefono, documento } = usuarioData;
      db.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, documento = ? WHERE id = ?',
        [nombre, apellido, email || null, telefono || null, documento, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...usuarioData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async toggleActivo(id) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE usuarios SET activo = NOT activo WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else {
          db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err2, results2) => {
            if (err2) reject(err2);
            else resolve(results2[0]);
          });
        }
      });
    });
  }

  static async getEventosByUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT e.*, re.fecha_registro, re.notas 
         FROM eventos e
         INNER JOIN registros_eventos re ON e.id = re.evento_id
         WHERE re.usuario_id = ?
         ORDER BY e.fecha_evento DESC`,
        [usuarioId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = Usuario;

