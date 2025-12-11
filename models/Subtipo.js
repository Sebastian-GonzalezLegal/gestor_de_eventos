const db = require('../config/database');

class Subtipo {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT s.*, t.nombre as tipo_nombre
         FROM subtipos s
         INNER JOIN tipos t ON s.tipo_id = t.id
         ORDER BY t.nombre ASC, s.nombre ASC`,
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
        `SELECT s.*, t.nombre as tipo_nombre
         FROM subtipos s
         INNER JOIN tipos t ON s.tipo_id = t.id
         WHERE s.id = ?`,
        [id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    });
  }

  static async findByTipo(tipoId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT s.*, t.nombre as tipo_nombre
         FROM subtipos s
         INNER JOIN tipos t ON s.tipo_id = t.id
         WHERE s.tipo_id = ?
         ORDER BY s.nombre ASC`,
        [tipoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  static async create(subtipoData) {
    return new Promise((resolve, reject) => {
      const { nombre, tipo_id } = subtipoData;
      db.query(
        'INSERT INTO subtipos (nombre, tipo_id) VALUES (?, ?)',
        [nombre, tipo_id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...subtipoData });
        }
      );
    });
  }

  static async update(id, subtipoData) {
    return new Promise((resolve, reject) => {
      const { nombre, tipo_id } = subtipoData;
      db.query(
        'UPDATE subtipos SET nombre = ?, tipo_id = ? WHERE id = ?',
        [nombre, tipo_id, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...subtipoData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM subtipos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = Subtipo;