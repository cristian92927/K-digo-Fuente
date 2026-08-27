# Módulo de Gestión de Promociones

Aplicación web para registrar y gestionar promociones con control de estado y vigencia.

## Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Base de datos:** PostgreSQL 16
- **Infraestructura:** Docker + docker-compose

---

## Levantar el proyecto localmente

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución

### Pasos

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd promociones

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 3. Levantar todos los servicios
docker compose up --build
```

La aplicación queda disponible en:

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:3000 |
| Health check | http://localhost:3000/health |

Para detener:

```bash
docker compose down
```

Para detener y borrar los volúmenes (limpia la BD):

```bash
docker compose down -v
```

---

## Variables de entorno requeridas

Ver `.env.example` para la lista completa. Las variables sensibles deben configurarse como **GitHub Secrets** para el pipeline de CI/CD:

| Variable | Descripción |
|---|---|
| `POSTGRES_USER` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | Contraseña de la base de datos |
| `POSTGRES_DB` | Nombre de la base de datos |

---

## Desarrollo local sin Docker

### Backend

```bash
cd backend
npm install
# Crear backend/.env con DATABASE_URL apuntando a un PostgreSQL local
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) ejecuta en orden:

1. **Lint** — verifica estilo en backend y frontend
2. **Test** — pruebas unitarias del backend
3. **Build** — construye las imágenes Docker
4. **Smoke test** — levanta la aplicación y verifica que `/health` responde `200 OK`

El pipeline falla si alguna variable de entorno requerida no está definida como secret.
