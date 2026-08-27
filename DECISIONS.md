# DECISIONS.md — Módulo de Gestión de Promociones

## Stack seleccionado

| Capa | Tecnología | Alternativas consideradas |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | — (obligatorio) |
| Backend | Node.js + Express + TypeScript | Laravel |
| ORM | Prisma | TypeORM, Sequelize |
| Base de datos | PostgreSQL | MongoDB, SQL Server |
| Contenedores | Docker + docker-compose | — |

---

## Decisiones y justificaciones

### Node.js vs Laravel

Se eligió **Node.js con Express** porque:
- El módulo es un CRUD pequeño sin lógica de negocio compleja: no se necesita el scaffolding de un framework full. Express añade solo lo necesario.
- Compartir TypeScript entre frontend y backend permite reutilizar los tipos de dominio (`Promocion`, `TipoDescuento`, `EstadoPromocion`) sin duplicar contratos.
- El equipo que recibe el proyecto ya conoce el ecosistema JS/TS, reduciendo la curva de onboarding.

Laravel hubiera sido preferible si el proyecto tuviera autenticación, roles y permisos complejos, o si el equipo fuera principalmente PHP.

### PostgreSQL vs MongoDB

Se eligió **PostgreSQL** porque:
- Los datos de promociones son estructurados y con relaciones claras (`Promocion` ↔ `HistorialEstado`). Una BD relacional evita denormalización innecesaria.
- Las consultas de resumen (agrupación por estado, filtro de vigencia por fecha) son triviales en SQL y más verbosas en MongoDB.
- PostgreSQL tiene soporte nativo de tipos `DATE`, `DECIMAL` y enums, que se mapean directamente al modelo de dominio.

MongoDB hubiera sido preferible si los objetos de promoción fueran variables en estructura o si se requiriera escalar horizontalmente desde el inicio.

### Prisma como ORM

- Genera un cliente TypeScript tipado desde el schema, eliminando errores en queries en tiempo de ejecución.
- Las migraciones (`prisma migrate`) son versionadas y reproducibles, lo que simplifica el flujo de deploy.
- El schema sirve como documentación viva del modelo de datos.

### Dos tablas

Se definieron dos tablas para cumplir el requisito mínimo de forma útil:

- **`Promocion`**: entidad principal.
- **`HistorialEstado`**: auditoría de cada cambio de estado. Permite saber cuándo pasó una promoción de `PROGRAMADA` a `ACTIVA` o de `ACTIVA` a `FINALIZADA`, lo que es valioso en un contexto de POS donde los errores de vigencia son el problema central.

### Zod para validaciones

Se usa **Zod** en lugar de validar manualmente en el handler: centraliza las reglas, genera errores descriptivos por campo, y el schema sirve como especificación ejecutable de los invariantes de negocio.

### CI/CD en 4 etapas

El pipeline sigue la cadena `lint → test → build → smoke-test` con dependencias explícitas. El smoke test levanta la aplicación real con `docker compose up` y verifica `/health` con `curl`, que prueba tanto el proceso del backend como la conexión a la base de datos. El pipeline falla explícitamente si alguna variable de entorno requerida no está definida como secret.

---

> "No importa si el gato es blanco o negro, siempre y cuando cace ratones." — El objetivo fue entregar algo que funciona, que se puede levantar con un comando y que el pipeline de CI valida de forma automática.
