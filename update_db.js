const db = require('./config/database');

const alterTableQuery = `
  ALTER TABLE usuarios
  ADD COLUMN subsecretaria_id INT NULL,
  ADD CONSTRAINT fk_usuario_subsecretaria
  FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id)
  ON DELETE SET NULL;
`;

const updateEnumQuery = `
  ALTER TABLE usuarios
  MODIFY COLUMN rol ENUM('admin', 'user', 'visitante', 'subsecretaria') DEFAULT 'user';
`;

console.log('Running database migration...');

db.query(updateEnumQuery, (err, result) => {
    if (err) {
        console.error('Error updating ENUM:', err);
    } else {
        console.log('Updated rol ENUM successfully.');
    }
    
    db.query(alterTableQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column subsecretaria_id already exists.');
            } else {
                console.error('Error altering table:', err);
            }
        } else {
            console.log('Table usuarios altered successfully.');
        }
        process.exit();
    });
});
