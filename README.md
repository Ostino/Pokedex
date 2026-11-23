# Pokedex

Aplicación web full-stack para crear y gestionar equipos Pokémon: cada entrenador arma sus equipos eligiendo Pokémon de la Pokédex y configurando su naturaleza, habilidad, objeto, movimientos, IVs y EVs, con el cálculo de sus estadísticas finales.

**Demo:** [TU-LINK](https://demodexoscar.onrender.com)

Puede tardar un minuto en levantar la pagina y ser algo lenta por el servicio de demo gratuito

## Probar la demo

Tienes dos opciones:

1. **Entrar con la cuenta demo** (lo más rápido): pulsa **«Entrar con la cuenta demo»** en el inicio de sesión, o escribe sus datos:

   | Usuario | Contraseña |
   | --- | --- |
   | `demo` | `demo1234` |

   La cuenta siempre está disponible. Los equipos que crees con ella **se borran a los 10 minutos**, así cada visitante la encuentra limpia.

2. **Crear tu propia cuenta** desde "Regístrate aquí". Es una cuenta de prueba: **se borra a los 10 minutos** de crearla, junto con sus equipos. La web te avisa del tiempo que le queda y, cuando se borra, te lleva al inicio de sesión. Después puedes crear otra o usar la cuenta demo.

> La demo está en el plan gratuito de Render, que duerme el servicio cuando no se usa: **la primera carga puede tardar alrededor de un minuto**. Cada reinicio devuelve los datos a su estado inicial.

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
- **Limpieza de la demo.** Con `DEMO_LIMPIEZA_MINUTOS` definida, cada minuto se borra lo que crearon los visitantes hace más de ese tiempo: las cuentas registradas (con sus sesiones, equipos y Pokémon), los equipos y Pokémon creados con la cuenta `demo` y los EVs, IVs y stats sueltos. Nunca se tocan `admin`, `demo`, los datos de la semilla ni el catálogo (Pokémon base, objetos, movimientos, tipos, naturalezas y habilidades). Ver `backend/limpiezaDemo.js`.
  El frontend lo avisa: `GET /api/demo` publica los minutos (el registro y el login lo muestran), `/api/entrenadores/me` dice cuándo se borrará la cuenta (cuenta atrás en el perfil y en la edición de equipos), y el 401 de una cuenta borrada lleva el código `CUENTA_ELIMINADA` para que el login explique qué pasó. Sin la variable no aparece ningún aviso.

## Ejecutar en local

Requisitos: Node.js 20.12 o superior.

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

Abre http://localhost:5173.

### Variables de entorno (backend)

El backend lee `backend/.env` al arrancar, si existe (no se sube a git). Para crearlo, copia la plantilla y completa los valores:

```bash
cp backend/.env.example backend/.env
```

Las variables definidas en la terminal o en el panel de Render tienen prioridad sobre el archivo. Sin `ADMIN_PASSWORD`, el usuario `admin` conserva la contraseña de la semilla (`admin`) y el servidor lo avisa al arrancar.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NODE_ENV` | No | `production` activa las comprobaciones de producción. |
| `PORT` | No | Puerto del servidor (por defecto `3000`; Render lo define solo). |
| `JWT_SECRET` | En producción | Secreto para firmar los JWT. En desarrollo se usa uno de prueba y se muestra un aviso. |
| `ADMIN_PASSWORD` | En producción | Contraseña del usuario `admin`; se aplica en cada arranque. |
| `DEMO_PASSWORD` | No | Si está definida, crea o actualiza el usuario `demo` y activa el botón «Entrar con la cuenta demo» del login (`POST /api/auth/demo`). |
| `DB_PATH` | No | Ruta de la base de trabajo (por defecto `backend/database/pokebase.runtime.sqlite`). |
| `DEMO_LIMPIEZA_MINUTOS` | No | Si está definida, borra los datos de visitantes con más de esos minutos (en la demo, `10`). Sin ella no se borra nada. |

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

- **Build:** `npm ci --prefix frontend --include=dev && npm run build --prefix frontend && npm ci --prefix backend --omit=dev`
  (`--include=dev` hace falta porque, con `NODE_ENV=production`, npm omite las dependencias de desarrollo y Vite es una de ellas).
- **Start:** `npm start --prefix backend`
- **Health check:** `GET /api/health`
- **Variables:** `NODE_ENV=production`, `NODE_VERSION=22`, `JWT_SECRET`, `ADMIN_PASSWORD`, `DEMO_PASSWORD=demo1234` (la misma contraseña que se publica arriba), `DEMO_LIMPIEZA_MINUTOS=10`

---

Proyecto de práctica sin fines comerciales. Pokémon y sus nombres e imágenes son marcas de Nintendo, Game Freak y The Pokémon Company.
