const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.datos_anteriores, u.fecha_creacion, u.fecha_actualizacion, u.subsecretaria_id, s.nombre as subsecretaria_nombre FROM usuarios u LEFT JOIN subsecretarias s ON u.subsecretaria_id = s.id ORDER BY u.fecha_creacion DESC', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.datos_anteriores, u.fecha_creacion, u.fecha_actualizacion, u.subsecretaria_id, s.nombre as subsecretaria_nombre FROM usuarios u LEFT JOIN subsecretarias s ON u.subsecretaria_id = s.id WHERE u.id = ?', [id], (err, results) => {
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

  static async create(usuarioData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { nombre, email, password, rol = 'user', subsecretaria_id = null } = usuarioData;

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(
          'INSERT INTO usuarios (nombre, email, password, rol, subsecretaria_id) VALUES (?, ?, ?, ?, ?)',
          [nombre, email, hashedPassword, rol, subsecretaria_id],
          (err, results) => {
            if (err) reject(err);
            else resolve({
              id: results.insertId,
              nombre,
              email,
              rol,
              subsecretaria_id,
              activo: true,
              fecha_creacion: new Date()
            });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static async update(id, usuarioData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Obtener datos actuales para el historial
        const currentUser = await this.findById(id);
        
        if (!currentUser) {
          return resolve(null);
        }

        // Obtener la contraseña actual que no viene en findById
        const currentPassword = await new Promise((res, rej) => {
           db.query('SELECT password FROM usuarios WHERE id = ?', [id], (err, results) => {
             if (err) rej(err);
             else res(results[0]?.password);
           });
        });

        const previousData = {
          nombre: currentUser.nombre,
          email: currentUser.email,
          rol: currentUser.rol,
          subsecretaria_id: currentUser.subsecretaria_id,
          activo: currentUser.activo,
          password: currentPassword, // Guardar el hash de la contraseña
          fecha_guardado: new Date()
        };

        const { nombre, email, password, rol, subsecretaria_id } = usuarioData;
        let query = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, subsecretaria_id = ?, datos_anteriores = ?';
        let params = [nombre, email, rol, subsecretaria_id, JSON.stringify(previousData)];

        // Si se proporciona una nueva contraseña, hacer hash
        if (password) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          query += ', password = ?';
          params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        db.query(query, params, (err, results) => {
          if (err) reject(err);
          else {
            // Obtener el usuario actualizado
            db.query('SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.fecha_creacion, u.fecha_actualizacion, u.subsecretaria_id, s.nombre as subsecretaria_nombre FROM usuarios u LEFT JOIN subsecretarias s ON u.subsecretaria_id = s.id WHERE u.id = ?', [id], (err2, results2) => {
              if (err2) reject(err2);
              else resolve(results2[0]);
            });
          }
        });
      } catch (error) {
        reject(error);
      }
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
          db.query('SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.fecha_creacion, u.fecha_actualizacion, u.subsecretaria_id, s.nombre as subsecretaria_nombre FROM usuarios u LEFT JOIN subsecretarias s ON u.subsecretaria_id = s.id WHERE u.id = ?', [id], (err2, results2) => {
            if (err2) reject(err2);
            else resolve(results2[0]);
          });
        }
      });
    });
  }

  // Método para verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Método para autenticar usuario
  static async authenticate(email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.findByEmail(email);

        if (!user) {
          return resolve(null);
        }

        if (!user.activo) {
          return resolve(null);
        }

        const isValidPassword = await this.verifyPassword(password, user.password);

        if (!isValidPassword) {
          return resolve(null);
        }

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Usuario;
