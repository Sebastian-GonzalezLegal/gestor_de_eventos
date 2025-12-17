# Guía de Integración: mipagina.com/gestion

Esta guía detalla cómo integrar el "Gestor de Eventos" (Node.js/React) dentro de tu sitio web existente en PHP (`mipagina.com`) para que funcione bajo la ruta **`mipagina.com/gestion`**.

---

## 1. Configuración del Frontend (React)

Para que la aplicación de React sepa que ya no está en la raíz del dominio, debes hacer dos ajustes antes de compilarla.

### A. Modificar `package.json`
Entra a la carpeta `client/` y edita el archivo `package.json`. Agrega la propiedad `"homepage"`:

```json
{
  "name": "client",
  "version": "0.1.0",
  "homepage": "/gestion",
  "private": true,
  ...
}
```
*Esto asegura que los archivos CSS y JS se busquen en `/gestion/static/...` en lugar de `/static/...`.*

### B. Modificar el Router (React Router)
Si usas `BrowserRouter` en tu código (normalmente en `client/src/index.js` o `App.js`), debes agregar el `basename`.

Busca donde se define el Router y cámbialo a:
```jsx
<BrowserRouter basename="/gestion">
  <App />
</BrowserRouter>
```

### C. Compilar
Una vez hechos estos cambios, genera la versión de producción:
```bash
cd client
npm run build
```
Esto creará una carpeta `build` optimizada y lista para subir.

---

## 2. Configuración del Servidor (Proxy Inverso)

El objetivo es que tu servidor web (que sirve el PHP) intercepte cualquier petición a `mipagina.com/gestion` y se la pase a la aplicación Node.js.

### Si usas Apache (lo más común con PHP)

Debes tener habilitados los módulos `mod_proxy` y `mod_proxy_http`.

Edita el archivo de configuración de tu sitio (VirtualHost) o, si tu hosting lo permite, añade esto en tu archivo **`.htaccess`** principal (en la raíz de `public_html`):

```apache
<IfModule mod_proxy.c>
    # Redirigir tráfico de /gestion al puerto de Node.js (ej: 5000)
    ProxyRequests Off
    ProxyPreserveHost On
    
    # Redirigir la API (backend)
    ProxyPass /gestion/api http://localhost:5000/api
    ProxyPassReverse /gestion/api http://localhost:5000/api

    # Redirigir el Frontend (React servido por Node.js o Servidor estático)
    # OPCIÓN A: Si Node.js sirve los archivos estáticos en '/'
    ProxyPass /gestion http://localhost:5000/
    ProxyPassReverse /gestion http://localhost:5000/
</IfModule>
```

**Nota:** Asegúrate de que tu aplicación Node.js (`server.js`) esté configurada para servir los archivos estáticos de la carpeta `client/build` cuando se le pida la raíz.
*En `server.js` deberías tener algo así:*
```javascript
// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, 'client/build')));

// Manejar cualquier otra ruta devolviendo index.html (para que funcione el routing de React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
```

### Si usas Nginx

Edita el bloque `server` de tu dominio:

```nginx
server {
    server_name mipagina.com;
    
    # ... configuración existente de PHP ...

    # Configuración para /gestion
    location /gestion {
        # Reescribir la URL para quitar '/gestion' antes de pasarla a Node si es necesario,
        # o manejarlo desde Node.
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Ejecución

1.  Sube el proyecto (Backend + carpeta `client/build`) a una carpeta segura de tu servidor (ej: `/var/www/gestor_app`).
2.  Inicia el servidor Node.js en el puerto 5000 (usando `pm2`):
    ```bash
    pm2 start server.js --name "gestor-app"
    ```
3.  ¡Listo! Accede a `mipagina.com/gestion`.
