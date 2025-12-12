const bcrypt = require('bcryptjs');

async function verifyPassword() {
  const plainPassword = 'Admin123!';
  const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

  try {
    console.log('Verificando contraseña...');
    console.log('Contraseña plana:', plainPassword);
    console.log('Hash almacenado:', hashedPassword);

    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('¿Contraseña válida?', isValid);

    if (isValid) {
      console.log('✅ El hash de la contraseña es correcto');
    } else {
      console.log('❌ El hash de la contraseña no coincide');

      // Generar un nuevo hash correcto
      console.log('Generando nuevo hash...');
      const saltRounds = 10;
      const newHash = await bcrypt.hash(plainPassword, saltRounds);
      console.log('Nuevo hash:', newHash);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyPassword();
