# Pokedex

Aplicación web full-stack para crear y gestionar equipos Pokémon: cada entrenador arma sus equipos eligiendo Pokémon de la Pokédex y configurando su naturaleza, habilidad, objeto, movimientos, IVs y EVs, con el cálculo de sus estadísticas finales.

**Demo:** TU-LINK
**Cuenta demo:** usuario `demo` · contraseña `TU-CONTRASEÑA`

> La demo está en el plan gratuito de Render, que duerme el servicio cuando no se usa: **la primera carga puede tardar alrededor de un minuto**. Además, cada reinicio devuelve los datos a su estado inicial.

<!-- Capturas de pantalla: agrégalas aquí, por ejemplo:
![Perfil del entrenador](docs/capturas/perfil.png)
![Edición de equipo](docs/capturas/editar-equipo.png)
![Zona de administrador](docs/capturas/admin.png)
-->

## Funcionalidades

**Entrenadores**
- Registro e inicio de sesión con JWT; cierre de la sesión actual o de todas las sesiones.
- Perfil con sus equipos: crear, abrir para editar y eliminar.
- Edición de equipo: elegir Pokémon de la Pokédex, asignarles naturaleza, habilidad, objeto, hasta cuatro movimientos, IVs y EVs, y ver sus estadísticas finales a nivel 100 (con el modificador de la naturaleza).
- Ficha de cada Pokémon del equipo con tipos, movimientos, IVs, EVs y estadísticas.

**Administradores** (zona de administración)
- Entrenadores: dar o quitar el rol de administrador y cambiar contraseñas.
- CRUD de objetos y de Pokémon base (con subida de imagen, máximo 2 MB) y de movimientos.
- Asignación de estadísticas base a cada Pokémon base.

**Seguridad**
- Contraseñas con bcrypt; los JWT se verifican (firma y vencimiento) y además deben existir en la tabla de sesiones, así que el cierre de sesión los revoca.
- Cada entrenador solo puede ver y modificar sus propios equipos y Pokémon; los administradores, todos.

## Stack

- **Frontend:** React, Vite, React Router, axios
- **Backend:** Node.js, Express 5, Sequelize, SQLite, JWT, bcrypt, multer
- **Tests:** `node:test` y supertest

## Arquitectura

```
frontend/  React + Vite  ──build──▶  frontend/dist
backend/   Express 5
           ├─ /api/*        API REST
           ├─ /Imagenes/*   imágenes estáticas (Pokémon, objetos, tipos)
           └─ /*            frontend/dist (con respaldo a index.html para las rutas de React Router)
```

- **Un solo servidor, un solo dominio.** En producción, Express sirve la API y también el frontend compilado. En desarrollo, Vite corre aparte y su proxy reenvía `/api` e `/Imagenes` al backend, así que el frontend usa siempre rutas relativas.
- **Base de datos semilla.** `backend/database/Pokebase.sqlite` está versionada y es de **solo lectura**. Al arrancar, si no existe la base de trabajo (`DB_PATH`, por defecto `backend/database/pokebase.runtime.sqlite`, ignorada por git), se crea copiando la semilla. Por eso usar la app en local no deja cambios en git, y en Render cada reinicio parte de la semilla.
- **Cuentas.** Al arrancar se crea o actualiza el usuario `admin` con `ADMIN_PASSWORD` y, si está definida, la cuenta `demo` (rol entrenador) con `DEMO_PASSWORD`.

## Ejecutar en local

Requisitos: Node.js 20 o superior.

```bash
# Backend (http://localhost:3000)
cd backend
npm install
npm run dev

# Frontend (http://localhost:5173), en otra terminal
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Sin `ADMIN_PASSWORD`, el usuario `admin` conserva la contraseña de la semilla (`admin`) y el servidor lo avisa al arrancar. Para definir variables en la terminal:

```bash
ADMIN_PASSWORD=mi-clave DEMO_PASSWORD=demo123 npm run dev        # bash
```
```powershell
$env:ADMIN_PASSWORD="mi-clave"; $env:DEMO_PASSWORD="demo123"; npm run dev   # PowerShell
```

### Variables de entorno (backend)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NODE_ENV` | No | `production` activa las comprobaciones de producción. |
| `PORT` | No | Puerto del servidor (por defecto `3000`; Render lo define solo). |
| `JWT_SECRET` | En producción | Secreto para firmar los JWT. En desarrollo se usa uno de prueba y se muestra un aviso. |
| `ADMIN_PASSWORD` | En producción | Contraseña del usuario `admin`; se aplica en cada arranque. |
| `DEMO_PASSWORD` | No | Si está definida, crea o actualiza el usuario `demo`. |
| `DB_PATH` | No | Ruta de la base de trabajo (por defecto `backend/database/pokebase.runtime.sqlite`). |

En producción, si falta `JWT_SECRET` o `ADMIN_PASSWORD`, el servidor no arranca.

### Reiniciar los datos en local

Detén el backend y borra la base de trabajo; en el siguiente arranque se vuelve a copiar desde la semilla:

```bash
rm backend/database/pokebase.runtime.sqlite
```

### Actualizar la semilla

Para que unos datos nuevos (Pokémon, movimientos, objetos…) formen parte de la demo:

1. Créalos desde la app en local, con el backend en marcha.
2. Detén el backend.
3. Ejecuta `npm run semilla --prefix backend`. Copia la base de trabajo sobre `backend/database/Pokebase.sqlite` y vacía la tabla de sesiones (`Tokens`) para no publicar tokens.
4. Haz commit de `Pokebase.sqlite`.

La semilla también guarda los hashes de contraseña de los usuarios que existan en tu base local, así que usa contraseñas de prueba en local.

### Tests y build

```bash
npm test --prefix backend          # usa una base SQLite temporal, nunca la semilla
npm run build --prefix frontend    # genera frontend/dist, que el backend sirve si existe
```

Para probar el modo producción en local, compila el frontend y ejecuta `npm start --prefix backend` con `NODE_ENV=production`, `JWT_SECRET` y `ADMIN_PASSWORD`.

## Despliegue (Render)

Un único servicio web:

- **Build:** `npm ci --prefix frontend && npm run build --prefix frontend && npm ci --prefix backend --omit=dev`
- **Start:** `npm start --prefix backend`
- **Health check:** `GET /api/health`
- **Variables:** `NODE_ENV=production`, `NODE_VERSION=22`, `JWT_SECRET`, `ADMIN_PASSWORD`, `DEMO_PASSWORD`

---

Proyecto de práctica sin fines comerciales. Pokémon y sus nombres e imágenes son marcas de Nintendo, Game Freak y The Pokémon Company.
