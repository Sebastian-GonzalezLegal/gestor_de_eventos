const db = require('../config/database');

class Subsecretaria {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM subsecretarias ORDER BY nombre ASC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM subsecretarias WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async create(subsecretariaData) {
    return new Promise((resolve, reject) => {
      const { nombre } = subsecretariaData;
      db.query(
        'INSERT INTO subsecretarias (nombre) VALUES (?)',
        [nombre],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id: results.insertId, ...subsecretariaData });
        }
      );
    });
  }

  static async update(id, subsecretariaData) {
    return new Promise((resolve, reject) => {
      const { nombre } = subsecretariaData;
      db.query(
        'UPDATE subsecretarias SET nombre = ? WHERE id = ?',
        [nombre, id],
        (err, results) => {
          if (err) reject(err);
          else resolve({ id, ...subsecretariaData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM subsecretarias WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = Subsecretaria;