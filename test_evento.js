// Script de prueba para verificar que los eventos se guardan correctamente
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEvento() {
  try {
    console.log('🔍 Probando creación de evento con subsecretaría, tipo y subtipo...');

    // Primero crear datos de prueba si no existen
    console.log('📝 Creando datos de prueba...');

    // Crear subsecretaría
    const subsecretaria = await axios.post(`${API_URL}/subsecretarias`, {
      nombre: 'Subsecretaría de Test'
    });
    console.log('✅ Subsecretaría creada:', subsecretaria.data);

    // Crear tipo
    const tipo = await axios.post(`${API_URL}/tipos`, {
      nombre: 'Tipo de Test'
    });
    console.log('✅ Tipo creado:', tipo.data);

    // Crear subtipo
    const subtipo = await axios.post(`${API_URL}/subtipos`, {
      nombre: 'Subtipo de Test',
      tipo_id: tipo.data.id
    });
    console.log('✅ Subtipo creado:', subtipo.data);

    // Ahora crear evento con los IDs
    console.log('🎪 Creando evento...');
    const evento = await axios.post(`${API_URL}/eventos`, {
      nombre: 'Evento de Prueba',
      descripcion: 'Descripción del evento de prueba',
      fecha_evento: '2025-12-25',
      hora_evento: '15:00:00',
      lugar: 'Lugar de prueba',
      subsecretaria_id: subsecretaria.data.id,
      tipo_id: tipo.data.id,
      subtipo_id: subtipo.data.id
    });

    console.log('✅ Evento creado:', evento.data);

    // Verificar que se guardaron los datos correctamente
    const eventoGuardado = await axios.get(`${API_URL}/eventos/${evento.data.id}`);
    console.log('📋 Datos del evento guardado:');
    console.log('- Nombre:', eventoGuardado.data.nombre);
    console.log('- Subsecretaría:', eventoGuardado.data.subsecretaria_nombre);
    console.log('- Tipo:', eventoGuardado.data.tipo_nombre);
    console.log('- Subtipo:', eventoGuardado.data.subtipo_nombre);

    if (eventoGuardado.data.subsecretaria_nombre && eventoGuardado.data.tipo_nombre && eventoGuardado.data.subtipo_nombre) {
      console.log('🎉 ¡ÉXITO! Los datos se guardaron correctamente.');
    } else {
      console.log('❌ ERROR: Los datos no se guardaron correctamente.');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testEvento();