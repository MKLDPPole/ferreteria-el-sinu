# Ferretería El Sinú — Sistema de Inventarios

Proyecto integrador de la asignatura **Web y Sistemas Móviles** — Universidad Cooperativa de Colombia.
Momento 3: implementación, despliegue y documentación de la solución diseñada en los Momentos 1 y 2.

## Descripción del sistema

Aplicación web full stack para digitalizar el control de inventario de una ferretería:
registro de entradas/salidas/ajustes de stock, alertas automáticas de stock mínimo,
trazabilidad de movimientos por usuario y control de acceso por rol
(Administrador, Vendedor, Bodeguero).

Reemplaza el proceso manual descrito en el diagnóstico original (cuaderno físico +
Excel + comunicación por WhatsApp entre mostrador y bodega), eliminando la
desincronización de datos y los reprocesos de cuadre manual.

## Arquitectura general

```
[Cliente: React + Vite]  →  HTTP/REST  →  [Backend: FastAPI]  →  [PostgreSQL + Redis]
```

- **Frontend:** React (Vite), consume la API vía Axios, con manejo de sesión JWT.
- **Backend:** FastAPI (Python), expone la API REST, valida reglas de negocio,
  aplica control de acceso por rol.
- **Base de datos:** PostgreSQL como almacenamiento persistente (relaciones,
  restricciones ACID). Redis como caché de lecturas frecuentes de stock, con
  degradación resiliente: si Redis no está disponible, el sistema sigue
  operando directo contra PostgreSQL sin caerse.

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), bcrypt |
| Base de datos | PostgreSQL |
| Caché | Redis |
| Despliegue backend | Render |
| Despliegue frontend | Vercel |

## Estructura del repositorio

```
ferreteria-el-sinu/
├── ferreteria-el-sinu-backend/backend/
│   ├── app/
│   │   ├── main.py            # Punto de entrada FastAPI
│   │   ├── models.py          # Modelos SQLAlchemy (ERD del Momento 2)
│   │   ├── schemas.py         # Validación Pydantic
│   │   ├── cache.py           # Capa de caché Redis (resiliente)
│   │   ├── security.py        # JWT y control de roles
│   │   ├── seed.py            # Datos de ejemplo
│   │   └── routers/           # Endpoints por recurso
│   └── requirements.txt
└── ferreteria-el-sinu-frontend/frontend/
    └── src/
        ├── pages/              # Dashboard, Productos, Movimientos, Usuarios...
        ├── components/         # Layout, StockHealthBar, etc.
        ├── api/                # Cliente HTTP y endpoints
        └── context/            # Autenticación
```

## Instrucciones para ejecutar localmente

### Backend

```bash
cd ferreteria-el-sinu-backend/backend
pip install -r requirements.txt --break-system-packages
cp .env.example .env   # ajustar credenciales locales
uvicorn app.main:app --reload
python -m app.seed     # en otra terminal, carga datos de ejemplo
```

Requiere PostgreSQL y Redis corriendo localmente (Redis es opcional: si no
está disponible, el backend lo detecta y sigue funcionando sin caché).

### Frontend

```bash
cd ferreteria-el-sinu-frontend/frontend
npm install
cp .env.example .env   # ajustar VITE_API_URL si es necesario
npm run dev
```

Abrir `http://localhost:5173`. Usuarios de prueba:

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | ADMIN |
| vendedor | vendedor123 | VENDEDOR |
| bodeguero | bodega123 | BODEGUERO |

## Despliegue en producción

- **Backend (API):** https://ferreteria-sinu-backend.onrender.com
- **Documentación interactiva de la API (Swagger):** https://ferreteria-sinu-backend.onrender.com/docs
- **Frontend:** https://ferreteria-el-sinu.vercel.app

> **Nota sobre el backend en Render (plan gratuito):** el servicio "duerme"
> tras un período de inactividad. La primera petición tras inactividad puede
> tardar hasta 50 segundos en responder mientras el servidor despierta; las
> siguientes son inmediatas. Esto es una limitación conocida del plan
> gratuito, no un error del sistema.

## Retos, mejoras futuras y aprendizajes

**Retos técnicos enfrentados:**
- Resiliencia de la conexión a Redis: la versión inicial del backend fallaba
  por completo si Redis no estaba disponible al arrancar. Se corrigió para
  que el sistema detecte la ausencia de Redis y degrade a consultar
  PostgreSQL directamente, sin interrumpir el servicio.
- Incompatibilidad entre `passlib` y versiones recientes de `bcrypt`, resuelta
  usando la librería `bcrypt` directamente para el hash de contraseñas.

**Decisiones clave tomadas:**
- Se adoptó FastAPI en lugar de Flask, coherente con el análisis comparativo
  ya realizado en el Momento 2 (arquitectura "A" del análisis de
  optimización), en vez de introducir un cambio de stack no justificado.
- Se implementó JWT con roles desde el MVP (no como promesa futura), dado que
  ya estaba contemplado como requerimiento no funcional (RNF03) desde el
  Momento 2.

**Pantallas no implementadas conscientemente:**
- *Reportes* y *Configuración* aparecían en el mockup visual del Momento 2
  pero nunca se definió su alcance funcional exacto (qué filtros, qué
  gráficas, qué opciones de configuración). Se dejaron fuera del MVP para no
  improvisar requerimientos no especificados, y quedan documentadas como
  trabajo futuro.

**Mejoras futuras:**
- Resolución de conflictos de sincronización para el modo offline de la PWA.
- Refresh tokens con cookies `HttpOnly` para mayor seguridad en producción.
- Migrar Redis local a un servicio gestionado (Upstash o AWS ElastiCache)
  para tener caché activo también en producción.
- Ampliar el catálogo de pruebas automatizadas (actualmente las pruebas son
  manuales, documentadas con capturas y con un script de medición de
  latencia real).

**Aprendizajes:**
- La diferencia entre un sistema "que funciona en la demo" y uno "resiliente"
  a menudo está en el manejo de fallos de dependencias externas (como se vio
  con Redis), no en la lógica de negocio principal.
- Medir en vez de estimar (la sección de optimización del informe usa
  latencias reales medidas contra un catálogo de 4.000 SKU, no cifras
  hipotéticas) da resultados defendibles y más honestos.

## Autoría
Hecho por: Aaron Batista
Proyecto desarrollado para la actividad de evaluación #3 de Web y Sistemas
Móviles, Universidad Cooperativa de Colombia, sede Bogotá.
