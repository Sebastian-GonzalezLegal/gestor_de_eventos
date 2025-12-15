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
      const {
        nombre, apellido, email, telefono, documento,
        fecha_nacimiento, calle, altura, piso, departamento,
        entre_calle_1, entre_calle_2, barrio_id, localidad_id,
        otra_localidad, celular, genero_id, estudio_id,
        ocupacion, nacionalidad, estado_civil_id, barrio_especificacion
      } = vecinoData;

      const query = `
        INSERT INTO vecinos (
          nombre, apellido, email, telefono, documento,
          fecha_nacimiento, calle, altura, piso, departamento,
          entre_calle_1, entre_calle_2, barrio_id, localidad_id,
          otra_localidad, celular, genero_id, estudio_id,
          ocupacion, nacionalidad, estado_civil_id, barrio_especificacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        nombre, apellido, email || null, telefono || null, documento,
        fecha_nacimiento || null, calle || null, altura || null, piso || null, departamento || null,
        entre_calle_1 || null, entre_calle_2 || null, barrio_id || null, localidad_id || null,
        otra_localidad || null, celular || null, genero_id || null, estudio_id || null,
        ocupacion || null, nacionalidad || null, estado_civil_id || null, barrio_especificacion || null
      ];

      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve({ id: results.insertId, ...vecinoData });
      });
    });
  }

  static async update(id, vecinoData) {
    return new Promise((resolve, reject) => {
      const {
        nombre, apellido, email, telefono, documento,
        fecha_nacimiento, calle, altura, piso, departamento,
        entre_calle_1, entre_calle_2, barrio_id, localidad_id,
        otra_localidad, celular, genero_id, estudio_id,
        ocupacion, nacionalidad, estado_civil_id, barrio_especificacion
      } = vecinoData;

      const query = `
        UPDATE vecinos SET
          nombre = ?, apellido = ?, email = ?, telefono = ?, documento = ?,
          fecha_nacimiento = ?, calle = ?, altura = ?, piso = ?, departamento = ?,
          entre_calle_1 = ?, entre_calle_2 = ?, barrio_id = ?, localidad_id = ?,
          otra_localidad = ?, celular = ?, genero_id = ?, estudio_id = ?,
          ocupacion = ?, nacionalidad = ?, estado_civil_id = ?, barrio_especificacion = ?
        WHERE id = ?
      `;

      const values = [
        nombre, apellido, email || null, telefono || null, documento,
        fecha_nacimiento || null, calle || null, altura || null, piso || null, departamento || null,
        entre_calle_1 || null, entre_calle_2 || null, barrio_id || null, localidad_id || null,
        otra_localidad || null, celular || null, genero_id || null, estudio_id || null,
        ocupacion || null, nacionalidad || null, estado_civil_id || null, barrio_especificacion || null,
        id
      ];

      db.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve({ id, ...vecinoData });
      });
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
