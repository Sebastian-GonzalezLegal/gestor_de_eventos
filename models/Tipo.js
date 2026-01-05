const db = require('../config/database');

class Tipo {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tipos ORDER BY nombre ASC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM tipos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async create(tipoData) {
    return new Promise((resolve, reject) => {
      const { nombre } = tipoData;
      db.query(
        'INSERT INTO tipos (nombre) VALUES (?)',
        [nombre],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...tipoData });
        }
      );
    });
  }

  static async update(id, tipoData) {
    return new Promise((resolve, reject) => {
      const { nombre } = tipoData;
      db.query(
        'UPDATE tipos SET nombre = ? WHERE id = ?',
        [nombre, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...tipoData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM tipos WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async getSubtipos(tipoId) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM subtipos WHERE tipo_id = ? ORDER BY nombre ASC',
        [tipoId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }
}

module.exports = Tipo;