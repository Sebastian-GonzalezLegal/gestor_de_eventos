const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLogin() {
  try {
    console.log('Probando login con credenciales de admin...');

    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@municipio.gob.ar',
      password: 'Admin123!'
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login falló: ${JSON.stringify(loginResponse.data)}`);
    }

    console.log('✅ Login exitoso!');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    console.log('Usuario:', loginResponse.data.user.nombre);

    // Probar verificar token
    console.log('\nProbando verificación de token...');
    const verifyResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    if (verifyResponse.status !== 200) {
      throw new Error(`Verificación falló: ${JSON.stringify(verifyResponse.data)}`);
    }

    console.log('✅ Token verificado correctamente!');
    console.log('Usuario verificado:', verifyResponse.data.user.nombre);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testLogin();
