# Propuesta de arquitectura backend para Nexova

## 1. Resumen ejecutivo

Para Nexova, el patrón más adecuado es una arquitectura hexagonal aplicada sobre un monolito modular, con un backend centralizado basado en FastAPI o similar. La decisión se fundamenta en que la empresa tiene una necesidad clara y acotada: un sitio web corporativo, un formulario de talento, validaciones de negocio y la posibilidad de integrar más adelante con CRM, ATS, email y analytics sin reescribir la solución.

Este enfoque combina:

- separación clara entre negocio y tecnología,
- baja complejidad operativa inicial,
- fácil evolución a medida que aumente el volumen de candidatos y se incorporen nuevos flujos,
- menor riesgo que una arquitectura distribuida o serverless sin una demanda real de escalado extremo.

En otras palabras: no se necesita un sistema de microservicios ni una nube completamente event-driven desde el inicio; sí se necesita un backend bien estructurado, mantenible y preparado para crecer.

---

## 2. Patrón arquitectónico recomendado

### Opción recomendada: Hexagonal Architecture + monolito modular

La arquitectura hexagonal (puertos y adaptadores) es la mejor opción para Nexova porque permite aislar el núcleo de negocio de los detalles técnicos externos, como:

- formulario web,
- validación de email y teléfono,
- envío de notificaciones,
- almacenamiento de candidatos,
- CRM o ATS futuros,
- autenticación y seguimiento en analítica.

El núcleo del sistema concentra la lógica de negocio: registro de candidatos, validación de datos, clasificación por sector, idiomas y disponibilidad, y posterior canalización hacia almacenamiento o procesos de selección.

Los adaptadores externos se encargan de:

- persistencia (PostgreSQL o similar),
- notificaciones por email,
- integración con Google Sheets, Airtable, CRM, HubSpot o ATS,
- endpoints HTTP de la landing page,
- dashboards internos o reportes.

### Justificación de negocio

Nexova opera en un contexto B2B con una necesidad muy concreta: captar talento cualificado. No requiere un ecosistema con múltiples dominios altamente desacoplados ni una infraestructura compleja desde el primer día. Requiere, en cambio:

- un flujo de capture y validación confiable,
- trazabilidad del proceso,
- facilidad para modificar reglas de negocio,
- capacidad de crecimiento sin acoplar el código a una UI o a un proveedor concreto.

La arquitectura hexagonal responde mejor a este tipo de requerimiento que un MVC clásico o un serverless improvisado.

---

## 3. Comparativa de patrones arquitectónicos para Nexova

| Patrón | Ventaja para Nexova | Riesgo para Nexova |
| --- | --- | --- |
| MVC | Permite desarrollar rápido una primera versión web con una separación básica entre vista, control y modelo. Es simple de entender para equipos pequeños y muy útil en landing pages y formularios. | El acoplamiento entre la lógica de negocio y la capa de presentación puede crecer rápidamente. Si se usa para un flujo de talento con validaciones más complejas, se vuelve difícil mantenerla y escalarla. |
| Arquitectura en capas | Mejora la organización del código: presentación, aplicación, dominio e infraestructura. Facilita testeo y mantenimiento en proyectos medianos. | Si no existe una buena definición de responsabilidades, puede convertirse en una “capa de glorificación” donde todo termina en un servicio genérico y el dominio se diluye. |
| Hexagonal (puertos y adaptadores) | Aísla el núcleo de negocio de la web, base de datos y CRM. Permite cambiar proveedores sin romper la lógica principal. Es ideal para un flujo de lead/candidato con validaciones y posibles integraciones futuras. | Requiere más disciplina arquitectónica y una mayor inversión inicial en diseño. Si el equipo es muy pequeño y no está acostumbrado, puede parecer más complejo de lo necesario. |
| Serverless | Muy buena opción para picos muy irregulares de tráfico, bajos costos operativos y despliegue ágil. Útil si el sitio tiene picos estacionales y poca carga base. | Puede introducir dependencia de un proveedor cloud, problemas de cold start, complejidad de observabilidad y latencia variable. Para una empresa con flujo estable no suele justificar la complejidad extra. |
| Microservicios | Excelente cuando hay muchos equipos, varios dominios y alta autonomía. | Para Nexova, es demasiado costoso en operación, coordinación, despliegue y monitoreo. Produce mayor complejidad sin un problema comprobado de escala. |

---

## 4. Recomendación final

### Elección recomendada

La mejor solución para Nexova es:

1. un backend centralizado con una API modular,
2. arquitectura hexagonal para separar dominio e infraestructura,
3. una implementación en monolito modular, no microservicios,
4. persistencia relacional para candidate records,
5. integración con servicios externos mediante adaptadores bien definidos.

### ¿Por qué no MVC puro?

Porque el formulario de talento no es solo una vista; incluye validaciones, reglas de negocio y posibles integraciones futuras con CRM/ATS. Un MVC puro empieza bien, pero se vuelve frágil cuando el sistema crece y la lógica del negocio se mezcla con la capa web.

### ¿Por qué no serverless como primera elección?

Porque Nexova no necesita un modelo de consumo extremadamente variable ni una estrategia de costos de “scale-to-zero” desde el primer día. El serverless puede ser una buena evolución, pero hoy no es el patrón base más adecuado para un negocio con operaciones bien definidas y requerimientos de mantenimiento controlado.

---

## 5. Estructura propuesta del backend

Una implementación razonable para Nexova podría tener esta organización:

```text
services/
  talent-api/
    app/
      main.py
      config/
      routes/
      schemas/
      controllers/
      use_cases/
      domain/
      ports/
      adapters/
    tests/
```

### Capas sugeridas

- Capa de presentación:
  - endpoints HTTP para la landing page y formulario,
  - validación de payloads,
  - serialización de respuestas.

- Capa de aplicación:
  - casos de uso como “registrar candidato”, “validar perfil”, “enviar notificación”.

- Capa de dominio:
  - entidades como `Candidate`, `TalentProfile`, `Availability`, `EnglishLevel`.
  - reglas de negocio, validaciones y restricciones.

- Capa de infraestructura:
  - repositorios para base de datos,
  - adapters para email, CRM, Airtable, analytics.

Esto mantiene el núcleo estable y facilita los cambios de tecnología sin alterar la lógica principal.

---

## 6. Estructura estándar de proyectos FastAPI y cómo influye en esta propuesta

La comunidad de FastAPI suele organizar los proyectos de una manera muy consistente para mantener el sistema legible, testeable y fácil de escalar. Aunque no existe una única estructura obligatoria, las convenciones más comunes influyen directamente en la decisión de usar un monolito modular con arquitectura hexagonal.

### Convenciones más habituales

Un proyecto FastAPI típico suele dividirse en:

```text
app/
  main.py
  api/
    deps.py
    routes/
      users.py
      teams.py
      analytics.py
  core/
    config.py
    security.py
  db/
    base.py
    session.py
  models/
  schemas/
  services/
  use_cases/
  repositories/
  tests/
```

Estas estructuras tienden a reunirse en torno a cuatro ideas clave:

1. `main.py` como punto de entrada de la aplicación.
2. `routes/` para definir endpoints y agruparlos por dominio.
3. `schemas/` para validaciones de entrada/salida con Pydantic.
4. `core/`, `db/`, `services/` y `repositories/` para separar configuración, infraestructura y lógica técnica del dominio.

### Cómo se aplica esto en Nexova

Nexova encaja muy bien con estas convenciones, porque el proyecto tiene un caso de uso concreto y un dominio claro: gestión de talento. Por eso, la estructura recomendada no es un monolito caótico, sino un monolito modular con routers por dominio y servicios para las acciones del negocio.

Esto influye en las decisiones de arquitectura de varias maneras:

- Los routers se dividen por dominio para mantener cada archivo enfocado en un tema concreto.
- La configuración se centraliza en `core/config.py` o equivalente para evitar hardcode de variables de entorno.
- Los modelos y esquemas se separan para distinguir claramente la entidad del negocio y la representación HTTP.
- Los repositorios y adaptadores encapsulan la persistencia y las integraciones externas, manteniendo el núcleo del dominio limpio.
- La inyección de dependencias de FastAPI (`Depends`) ayuda a aislar autenticación, validaciones y acceso a datos.

### Relación con la arquitectura hexagonal

La estructura estándar de FastAPI refuerza la arquitectura hexagonal porque encaja perfectamente con los conceptos de:

- puertos: interfaces del dominio,
- adaptadores: repositorios, email, CRM, sesiones, rutas HTTP,
- casos de uso: lógica de negocio del registro de candidatos,
- infra: configuración, persistencia y servicios externos.

Es decir, la forma estándar de organizar FastAPI no solo es una buena práctica de mantenibilidad, sino que también respalda la separación necesaria para una solución como Nexova.

### Impacto práctico en este proyecto

Para Nexova, esta convención implica:

- mantener `routes/talent.py`, `routes/company.py`, `routes/services.py` y `routes/admin.py` separados,
- definir schemas por dominio (`talent.py`, `company.py`, `analytics.py`),
- centralizar configuración en un módulo de entorno y seguridad,
- dejar la lógica de validación y flujo de registro de candidatos en capas de caso de uso y dominio,
- mantener los adaptadores externos detrás de interfaces para no acoplar la lógica del negocio a Google Sheets, CRM o email.

En resumen, la estructura típica de FastAPI no es solo una cuestión estética: es una guía que refuerza nuestra decisión de usar un backend modular, con dominios bien delimitados, servicios bien definidos y un diseño preparado para crecer sin perder claridad.

---

## 7. Frontend y backend separados: organización práctica y decisiones de integración

En proyectos modernos, es muy habitual separar el frontend y el backend en sistemas distintos. Esto puede implementarse de dos formas:

### Opción A: repositorios separados

Cada parte vive en su propio repositorio:

- `nexova-web/` para la landing page y el frontend,
- `nexova-api/` para el backend FastAPI,
- `nexova-infra/` para despliegue y configuración.

Ventajas:

- autonomía de equipos,
- despliegues y ciclos de release independientes,
- claro ownership por capa.

Riesgos:

- más coordinación entre equipos,
- duplicación de configuración,
- más complejidad de entorno local y despliegue.

### Opción B: monorepo

Todo se mantiene en un único repositorio con carpetas como:

```text
repo/
  ui/
  services/
  packages/
  infra/
  docs/
```

Ventajas:

- mejor coherencia entre equipos,
- compartir tipos, contratos y configuración,
- facilita el desarrollo conjunto.

Riesgos:

- repositorio más pesado,
- más complejidad de arbolado y permisos,
- mayor riesgo de acoplar componentes en proyectos pequeños.

### Qué elegir para Nexova

Para Nexova, el enfoque más equilibrado es un monorepo a nivel de proyecto académico o de equipo pequeño, con una clara separación entre `uis/` y `services/`, como ya se propone en este repositorio. Esto permite:

- unificar documentación y contratos,
- mantener un flujo de trabajo sencillo,
- compartir tipos y esquemas,
- reducir fricción entre frontend y backend.

Sin embargo, si el proyecto escala y hay equipos separados por responsabilidades, el siguiente paso natural es migrar a repositorios independientes, manteniendo la misma arquitectura y contratos.

### Comunicación entre frontend y backend

Cuando frontend y backend son sistemas separados, la comunicación debe ser por API HTTP/JSON. El frontend no debe depender directamente de la base de datos ni de la lógica del backend; solo debe consumir endpoints públicos.

La forma habitual es:

- frontend hace llamadas a `https://api.nexova.com` o un entorno local equivalente,
- el backend expone endpoints REST o JSON RPC-like,
- el frontend solo consume los recursos que necesita perfil, servicios y lead submission.

### Variables de entorno

La separación funcional exige variables de entorno bien definidas en ambos lados.

Ejemplos:

- Backend:
  - `DATABASE_URL`
  - `SECRET_KEY`
  - `EMAIL_HOST`
  - `SMTP_USER`
  - `CORS_ORIGINS`
  - `APP_ENV`

- Frontend:
  - `VITE_API_BASE_URL`
  - `VITE_APP_ENV`
  - `VITE_ANALYTICS_ID`

Esto evita que el código se acople a URLs reales, credenciales o ambientes de despliegue.

### CORS

Cuando el frontend corre en un dominio distinto al del backend, es necesario configurar CORS correctamente. El backend debe permitir solo los orígenes autorizados, por ejemplo:

- `https://www.nexova.com`
- `https://nexova.com`
- `http://localhost:3000` (entorno local)

Una configuración típica incluye:

- `allow_origins`: lista controlada de dominios,
- `allow_methods`: `GET`, `POST`, `PATCH`, `OPTIONS`,
- `allow_headers`: `Authorization`, `Content-Type`,
- `allow_credentials`: según el flujo real del proyecto.

Esto es fundamental porque el formulario de talento lo consumirá desde la landing page web, muy probablemente en un dominio separado del backend API.

### Recomendación para Nexova

En el caso de Nexova, la estructura recomendada es:

- frontend public-facing y backend API separados a nivel de responsabilidades,
- monorepo para facilitar la entrega del proyecto académico,
- comunicación por API REST con JSON,
- configuración externa por variables de entorno,
- CORS estrictamente controlado en el backend,
- contrato claro entre frontend y API para formularios, servicios y contacto.

Esto permite un sistema robusto, seguro y fácil de mantener sin introducir complejidad innecesaria de microservicios.

---

## 8. Riesgos y puntos de atención si no se sigue la estructura propuesta

Si el equipo decide acelerar el desarrollo sin respetar la estructura recomendada, se pueden generar varios problemas que no siempre salen a simple vista en una fase inicial, pero que luego aumentan el coste de mantenimiento.

### 1) Acoplamiento fuerte entre frontend y lógica de negocio

Cuando los endpoints, las validaciones y la lógica de negocio se mezclan dentro de la API o directamente en la UI, el sistema se vuelve frágil. Un cambio de requisito simple, como ampliar los campos del formulario o cambiar la regla de disponibilidad, puede requerir tocar varios archivos sin una separación clara.

Consecuencia: el código se vuelve difícil de testear, más costoso de mantener y más propenso a errores de regresión.

### 2) Crecimiento desordenado del backend

Si todos los endpoints se meten en un único archivo o si los routers no se agrupan por dominio, el código crecerá sin criterio. El proyecto tendrá endpoints de talento, servicios, analítica y administración mezclados en el mismo sitio, dificultando la comprensión del sistema y la colaboración.

Consecuencia: se pierde trazabilidad, se duplican validaciones y se vuelve mucho más difícil incorporar nuevos equipos o procesos.

### 3) Problemas de seguridad y configuración

Si las variables de entorno, permisos, CORS y secretos no se gestionan con disciplina, la aplicación puede quedar expuesta a errores de seguridad o a fallos por entorno. Por ejemplo, si la API permite cualquier origen o if se hardcodean credenciales, el despliegue queda frágil y poco reproducible.

Consecuencia: la solución puede funcionar en local y romperse en producción o quedar vulnerable a accesos indebidos.

### 4) Dificultad para integrar nuevas fuentes de datos

Nexova tiene un crecimiento natural hacia más integraciones: CRM, ATS, automatización por email, analytics y revisiones de candidatos. Si el núcleo del negocio está acoplado a una base de datos o a un proveedor específico, cada nueva integración se vuelve un costo alto.

Consecuencia: la evolución del negocio se frena y la arquitectura deja de ser adaptable.

### Recomendación práctica

Para evitar esto, el equipo debe mantener:

- separación clara entre dominio, infraestructura y presentación,
- rutas agrupadas por dominio,
- configuración centralizada,
- contratos definidos entre frontend y API,
- validaciones en la capa de dominio y casos de uso.

Esto no es burocracia; es lo que hace sostenible una solución que necesita crecer sin perder calidad.

---

## 9. Organización de endpoints y routers en FastAPI

Para Nexova, la API debería estructurarse por dominios del negocio y no por tipo técnico de archivo. Esto permite que la aplicación crezca sin mezclar responsabilidades. La idea es mantener routers pequeños, con un objetivo claro y un conjunto de rutas homogéneo.

### Criterio principal de agrupación

Los routers se agrupan por dominio funcional del negocio, no por UX o por la capa técnica. Es decir:

- `talent/` para candidatos y perfiles profesionales,
- `company/` para información corporativa y contacto,
- `services/` para servicios ofrecidos por Nexova,
- `analytics/` para eventos de seguimiento y KPIs,
- `admin/` para operaciones internas o panel de reclutamiento.

Este criterio favorece la trazabilidad, la mantenibilidad y la evolución del código porque cada módulo representa un fragmento del negocio y no una mezcla de endpoints inconsistentes.

### Estructura sugerida

```text
services/
  talent-api/
    app/
      main.py
      config/
      routes/
        __init__.py
        talent.py
        company.py
        services.py
        analytics.py
        admin.py
      schemas/
        talent.py
        company.py
        analytics.py
      controllers/
      use_cases/
      domain/
      ports/
      adapters/
```

### Dominios identificados y rutas sugeridas

#### 1) Dominio Talent / Candidatos

Este es el dominio central de la solución y debe concentrar todo lo relacionado con la captación y gestión de perfiles.

Rutas sugeridas:

- `POST /api/v1/talent/register`
  - Registra un candidato con validaciones de negocio.
- `GET /api/v1/talent/{id}`
  - Obtiene el detalle de un candidato.
- `GET /api/v1/talent`
  - Lista candidatos con filtros por sector, nivel de inglés, disponibilidad o país.
- `PATCH /api/v1/talent/{id}`
  - Actualiza datos del perfil.
- `POST /api/v1/talent/{id}/status`
  - Cambia el estado del candidato (nuevo, en revisión, contactado, descartado, seleccionado).
- `GET /api/v1/talent/summary`
  - Devuelve métricas internas de volumen por sector y estado.

Criterio: todo lo relativo a candidatos, perfiles y gestión del pipeline de talento va en este router.

#### 2) Dominio Company / Información corporativa

Este router expone información pública del negocio y ayuda a la landing page y SEO.

Rutas sugeridas:

- `GET /api/v1/company/profile`
  - Devuelve datos corporativos básicos (nombre, ubicación, contacto, redes, descripción).
- `GET /api/v1/company/services`
  - Lista servicios de Nexova.
- `GET /api/v1/company/locations`
  - Devuelve sedes en Valencia y Miami.
- `GET /api/v1/company/contact`
  - Datos de contacto y horarios.

Criterio: cualquier dato orientado a presentación de la marca y contenido público va aquí.

#### 3) Dominio Services / Oferta de servicios

Este dominio permite documentar y exponer los servicios de Nexova de forma reutilizable.

Rutas sugeridas:

- `GET /api/v1/services`
  - Lista servicios disponibles.
- `GET /api/v1/services/{slug}`
  - Detalle de servicio específico.
- `POST /api/v1/services/lead`
  - Registro de interés de empresa en contratación de servicios.

Criterio: todo lo relacionado con the service catalog y la captación de interés empresarial va aquí, aunque la web principal para candidatos permanezca separada del formulario de talento.

#### 4) Dominio Analytics / Tracking y métricas

Para medir rendimiento del sitio, formularios y flujo de talentos.

Rutas sugeridas:

- `POST /api/v1/analytics/event`
  - Registra interacción o evento del sitio.
- `GET /api/v1/analytics/dashboard`
  - KPIs sobre tráfico, leads y conversiones.
- `GET /api/v1/analytics/funnel`
  - Muestra conversión del formulario de talento.

Criterio: todo lo relacionado con analítica, eventos y reportes debería vivir aquí para mantener decoupled la lógica de negocio de la captación.

#### 5) Dominio Admin / Operaciones internas

El backend interno administrará el pipeline y revisiones del equipo de talento.

Rutas sugeridas:

- `GET /api/v1/admin/candidates/pending`
  - Lista postulaciones pendientes.
- `GET /api/v1/admin/candidates/{id}/history`
  - Historial de revisiones del candidato.
- `POST /api/v1/admin/candidates/{id}/review`
  - Registro de revisión por parte del equipo.
- `PATCH /api/v1/admin/candidates/{id}/assign`
  - Asignación a responsable interno.

Criterio: funcionalidad de gestión interna, revisión de candidatos y operaciones del equipo de reclutamiento.

### Reglas buenas para FastAPI

- Cada router debe encapsular un solo dominio del negocio.
- Los nombres de endpoints deben estar en plural y ser descriptivos: `/talent`, `/services`, `/company`.
- El prefijo de versión debe mantenerse estable: `/api/v1`.
- Los modelos de entrada/salida deben vivir con el router o en un paquete `schemas/` por dominio.
- La lógica de validación debe quedar en casos de uso, no embebida directamente en el endpoint.
- Los endpoints públicos y privados deben separarse también por autenticación y permisos.

### Ejemplo de router funcional

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/talent", tags=["Talent"])

@router.post("/register")
def register_talent():
    pass

@router.get("/")
def list_talent():
    pass

@router.get("/{talent_id}")
def get_talent(talent_id: str):
    pass
```

Esta estructura permite mantener el backend claro, facil de testear y listo para seguir creciendo con más requisitos de reclutamiento, analítica y automatización.

---

## 7. Consideraciones técnicas para Nexova

### Datos de dominio clave

El backend debe manejar con claridad:

- nombre completo,
- email,
- teléfono,
- país de residencia,
- experiencia,
- sector de interés,
- nivel de inglés,
- disponibilidad,
- LinkedIn,
- comentarios,
- aceptación de política.

### Reglas de negocio esenciales

- email con formato válido,
- teléfono con prefijo internacional,
- experiencia entre 0 y 50,
- URL de LinkedIn válida si se incluye,
- límite de 500 caracteres en comentarios,
- política de tratamiento de datos obligatoria.

Estas reglas deben estar en el dominio, no en la UI, para que puedan reutilizarse desde web, API o futuros canales.

### Integraciones futuras

La arquitectura debe prever:

- CRM con contactos y seguimiento de candidatos,
- exportación a ATS o hojas de trabajo,
- automatización de email con seguimiento,
- analítica de volumen por sector, país y nivel de inglés,
- panel interno de reclutamiento.

Esto encaja muy bien con una arquitectura hexagonal y un monolito modular.

---

## 8. Conclusión

Para Nexova, la opción más sólida y rentable es una arquitectura hexagonal en un monolito modular, con un backend API centralizado. Es la mejor combinación entre:

- seguridad de diseño,
- mantenimiento sencillo,
- evolución del negocio,
- integración con herramientas externas,
- control de complejidad.

Es mucho más apropiada que un MVC puro, demasiada complejidad microservicios o un serverless sin necesidad real justificada.

Si el negocio crece, se puede evolucionar sin romper la base: primero añadiendo más casos de uso y adaptadores; luego, si fuera necesario, separando módulos o servicios de alto impacto sin tener que reescribir todo desde cero.
