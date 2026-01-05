const Usuario = require('./models/Usuario');

async function fixAdminPassword() {
  try {
    console.log('Actualizando contraseña del usuario admin...');

    // Buscar el usuario admin
    const adminUser = await Usuario.findByEmail('admin@municipio.gob.ar');

    if (!adminUser) {
      console.log('Usuario admin no encontrado. Creando usuario...');
      // Si no existe, crearlo
      const newAdmin = await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@municipio.gob.ar',
        password: 'Admin123!',
        rol: 'admin'
      });
      console.log('✅ Usuario admin creado:', newAdmin.nombre);
      return;
    }

    console.log('Usuario admin encontrado. Actualizando contraseña...');

    // Actualizar la contraseña
    const updatedUser = await Usuario.update(adminUser.id, {
      password: 'Admin123!'
    });

    console.log('✅ Contraseña del usuario admin actualizada correctamente');
    console.log('Email: admin@municipio.gob.ar');
    console.log('Contraseña: Admin123!');

  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
  }
}

fixAdminPassword();
