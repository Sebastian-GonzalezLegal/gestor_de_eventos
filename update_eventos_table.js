const db = require('./config/database');

const alterTableEventos = `
  ALTER TABLE eventos
  ADD COLUMN subsecretaria_id INT NULL,
  ADD COLUMN tipo_id INT NULL,
  ADD COLUMN subtipo_id INT NULL,
  ADD CONSTRAINT fk_evento_subsecretaria FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_evento_tipo FOREIGN KEY (tipo_id) REFERENCES tipos(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_evento_subtipo FOREIGN KEY (subtipo_id) REFERENCES subtipos(id) ON DELETE SET NULL;
`;

console.log('Running migration to add columns to eventos table...');

db.query(alterTableEventos, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
             console.log('Columns already exist (at least some of them). Checking individually...');
             // We could do individual checks but for now let's assume if one exists they might all exist or the user can run specific ones.
             // But to be safe, let's try adding them one by one ignoring errors.
             addColumnsOneByOne();
        } else {
            console.error('Error altering table eventos:', err);
             process.exit(1);
        }
    } else {
        console.log('Table eventos altered successfully.');
        process.exit(0);
    }
});

function addColumnsOneByOne() {
    const queries = [
        "ALTER TABLE eventos ADD COLUMN subsecretaria_id INT NULL",
        "ALTER TABLE eventos ADD CONSTRAINT fk_evento_subsecretaria FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id) ON DELETE SET NULL",
        "ALTER TABLE eventos ADD COLUMN tipo_id INT NULL",
        "ALTER TABLE eventos ADD CONSTRAINT fk_evento_tipo FOREIGN KEY (tipo_id) REFERENCES tipos(id) ON DELETE SET NULL",
        "ALTER TABLE eventos ADD COLUMN subtipo_id INT NULL",
        "ALTER TABLE eventos ADD CONSTRAINT fk_evento_subtipo FOREIGN KEY (subtipo_id) REFERENCES subtipos(id) ON DELETE SET NULL"
    ];

    let completed = 0;
    queries.forEach(query => {
        db.query(query, (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_DUP_KEYNAME') {
                console.error('Error executing query:', query, err.message);
            }
            completed++;
            if (completed === queries.length) {
                console.log('Finished attempting to add columns individually.');
                process.exit(0);
            }
        });
    });
}
