const db = require('../config/database');

class DashboardController {
  static async getStats(req, res) {
    try {
      const stats = {};

      // 1. Total Vecinos (Count)
      const vecinosPromise = new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as count FROM vecinos WHERE activo = 1', (err, results) => {
          if (err) reject(err);
          else resolve(results[0].count);
        });
      });

      // 2. Active Eventos (Count)
      const eventosPromise = new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as count FROM eventos WHERE activo = 1 AND fecha_evento >= CURRENT_DATE', (err, results) => {
          if (err) reject(err);
          else resolve(results[0].count);
        });
      });

      // 3. Registrations Today (Count)
      const registrationsPromise = new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as count FROM registros_eventos WHERE DATE(fecha_registro) = CURRENT_DATE', (err, results) => {
          if (err) reject(err);
          else resolve(results[0].count);
        });
      });

      // 4. Upcoming Events (List top 5)
      const upcomingEventsPromise = new Promise((resolve, reject) => {
        db.query(`
          SELECT e.id, e.nombre, e.fecha_evento, e.hora_evento,
                 (SELECT COUNT(*) FROM registros_eventos re WHERE re.evento_id = e.id) as inscritos
          FROM eventos e
          WHERE e.activo = 1 AND e.fecha_evento >= CURRENT_DATE
          ORDER BY e.fecha_evento ASC, e.hora_evento ASC
          LIMIT 5
        `, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const [totalVecinos, totalEventos, registrosHoy, proximosEventos] = await Promise.all([
        vecinosPromise,
        eventosPromise,
        registrationsPromise,
        upcomingEventsPromise
      ]);

      res.json({
        totalVecinos,
        totalEventos,
        registrosHoy,
        proximosEventos
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
  }
}

module.exports = DashboardController;
