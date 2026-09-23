# Propuesta de arquitectura de backend para Nexova

## 1. Resumen ejecutivo

Para Nexova, la arquitectura de backend más adecuada es un monolito modular con principios de arquitectura hexagonal en sus límites. Esta decisión está basada en las necesidades reales de la empresa: un negocio de recursos humanos con operación comercial moderada, una necesidad concreta de captar leads de talento y un proyecto de IA para automatizar el screening de candidatos.

No es recomendable iniciar con microservicios ni con una arquitectura distribuida completa. Nexova no presenta todavía un problema de escala que justifique la complejidad operativa de múltiples servicios, bases de datos y despliegues desacoplados. En cambio, sí requiere una arquitectura que permita crecer sin perder claridad en el dominio, mantener la lógica de negocio ordenada y facilitar la integración con IA, formularios web y sistemas externos.

La propuesta consiste en:

- un backend único (monolito) con módulos por dominio,
- separación clara entre dominio, casos de uso y adaptadores,
- APIs REST para la operación de talento y marketing,
- integración con un motor de IA para matching de candidatos,
- persistencia centralizada y trazabilidad de procesos,
- preparación para crecer sin necesidad de reescribir la base.

---

## 2. Contexto del negocio y su impacto en la arquitectura

Nexova es una consultora de recursos humanos con tres líneas de negocio principales:

- headhunting ejecutivo y de mandos medios,
- outsourcing de atención al cliente,
- formación corporativa.

Sin embargo, el proyecto de backend que se propone está orientado principalmente a la operación de talento y al ciclo de captación y selección de profesionales, como se describió en el contexto del proyecto y en la idea de agente IA para automatizar el filtrado de CVs.

Esto implica que el sistema debe soportar:

- registro de candidatos desde una landing page,
- validación de datos profesionales,
- almacenamiento estructurado de perfiles,
- criterios de selección según vacantes,
- comparación de experiencia, sector, nivel de inglés y disponibilidad,
- soporte para IA / ranking de candidatos,
- trazabilidad de decisiones y procesos,
- análisis operativos para marketing y reclutamiento.

Estas necesidades no requieren un ecosistema distribuido desde el comienzo. Requieren un backend robusto, cohesivo y mantenible, con una separación clara de responsabilidades.

---

## 3. Patrón arquitectónico recomendado

### 3.1 Monolito modular

Se recomienda un monolito modular como patrón principal.

Esto implica:

- una sola aplicación backend,
- una base de datos principal o al menos un modelo de persistencia unificado,
- módulos y servicios por dominio,
- interfaces bien definidas,
- despliegue único,
- evolución incremental sin fragmentar el sistema prematuramente.

### 3.2 Influencia hexagonal (puertos y adaptadores)

Dentro del monolito, se aplicarán principios de arquitectura hexagonal para separar la lógica de negocio de los mecanismos de infraestructura:

- dominio: entidades, reglas y servicios fundamentales,
- casos de uso: lógica de aplicación,
- puertos: contratos para repositorios, servicios externos y motores de IA,
- adaptadores: implementación con PostgreSQL, APIs, email, almacenamiento de documentos y servicios de IA.

Este enfoque permite que el negocio crezca sin mezclar reglas de dominio con detalles de persistencia, integración o UI.

---

## 4. Justificación técnica y de negocio

### 4.1 Encaja con el tamaño real de la empresa

La empresa cuenta con alrededor de 120 empleados y una facturación anual de 8 millones de dólares. No se observa una operación con cientos de equipos de software o una escala global que exija una división por servicios.

En este tipo de contexto, el costo de operar microservicios es mayor que el beneficio inicial:

- más despliegues,
- más servicios para monitorizar,
- más bases de datos,
- más coordinación entre equipos,
- más latencia operativa y más complejidad de integración.

En contraste, un monolito modular ofrece velocidad, claridad y menor fricción para un equipo de implementación académico o de crecimiento inicial.

### 4.2 El caso de uso central es de dominio y no de infraestructura

El problema principal de Nexova no es “conectar muchas aplicaciones”, sino “gestionar mejor el talento”.

La lógica central está en:

- perfiles de candidatos,
- vacantes,
- ponderación de competencias,
- matching con requisitos,
- fase de entrevista o selección,
- reporting para reclutamiento.

Esto es claramente un dominio del negocio, no un problema de integración distribuida. Por tanto, el backend debe priorizar claridad del modelo de negocio antes que fragmentación técnica.

### 4.3 Requiere integración con IA, pero no necesariamente a nivel de microservicios

La propuesta de agente IA para filtro de CVs requiere:

- procesamiento de documentos,
- consultas a modelos,
- validación de extracción de datos,
- scoring de candidatos,
- orquestación con flujos de negocio.

Esto puede integrarse perfectamente dentro de un monolito modular, usando servicios de IA como adaptadores externos. Es decir, se pueden consumir modelos desde un puerto definido dentro del dominio, sin necesidad de convertir la arquitectura completa en microservicios.

### 4.4 Facilita entregas rápidas y mantenibilidad

Los requisitos del proyecto requieren un despliegue iterativo:

- landing page,
- formulario de talento,
- validación de datos,
- base de datos de candidatos,
- IA para análisis,
- dashboard operativo.

Un monolito modular permite avanzar por etapas sin bloquearse con una estructura de servicios demasiado grande. Además, facilita pruebas, monitoring y mantenimiento para un equipo no aún muy grande.

---

## 5. Arquitectura propuesta

### 5.1 Vista general

La aplicación se organizará en capas lógicas:

1. Capa de presentación / API
   - endpoints REST para web, marketing y operaciones,
   - validación de entrada,
   - serialización de respuestas.

2. Capa de aplicación
   - casos de uso,
   - orquestación de flujos del negocio,
   - coordinación entre dominio e infraestructura.

3. Capa de dominio
   - entidades de negocio,
   - reglas y políticas,
   - servicios de dominio,
   - lógica de matching y selección.

4. Capa de infraestructura
   - repositorios,
   - acceso a base de datos,
   - integración con IA,
   - email, storage y auditoría,
   - servicios externos.

### 5.2 Módulos funcionales recomendados

El backend debe organizarse por dominios funcionales, por ejemplo:

- `candidates/`
  - registro y perfil del candidato,
  - validación,
  - historial, experiencia y disponibilidad,
  - estado del proceso.

- `jobs/`
  - vacantes y requisitos,
  - publicaciones,
  - criterios de matching.

- `selection/`
  - evaluación de candidatos,
  - scoring,
  - priorización,
  - estados del proceso.

- `ai_matching/`
  - conexión con modelo o servicio de IA,
  - extracción de CV,
  - análisis semántico y ranking.

- `leads/`
  - formularios web,
  - captación de leads de talento,
  - segmentación por sector y país.

- `analytics/`
  - KPIs de selección,
  - métricas de conversión,
  - reporting operativo.

- `identity/` (si aplica)
  - autenticación y gestión de usuarios del equipo interno.

---

## 6. Capa de integración de IA

El agente IA para filtrar candidatos puede implementarse como un módulo dentro del monolito, con una interface clara:

- `CandidateScoringService`
- `CvParserService`
- `JobMatchingEngine`
- `CandidateRanker`

Estas interfaces se implementan a través de adaptadores que pueden apuntar a:

- OpenAI u otro LLM,
- un servicio interno de embeddings,
- un pipeline local con procesamiento documental,
- o un sistema híbrido con reglas + IA.

La clave es que el dominio del reclutamiento no dependa directamente del proveedor de IA. Depende de una interfaz que puede cambiar sin impactar la lógica del negocio.

---

## 7. Persistencia y almacenamiento

Se recomienda una base de datos relacional para la capa transaccional principal, por ejemplo PostgreSQL.

Motivos:

- estructura de datos estable para candidatos, vacantes y procesos,
- validación de integridad referencial,
- consultas analíticas y reporting,
- buen soporte para un sistema de recruiting y lead management.

Se puede complementar con:

- almacenamiento de CVs en blob storage o archivo seguro,
- un data warehouse o analítica ligera para dashboards,
- una capa de datos para experimentación IA o de evaluación.

La base principal debe seguir el modelo del negocio y no estar diseñad a exclusivamente para un servicio de IA.

---

## 8. APIs y contratos

El backend debe exponer endpoints bien definidos, por ejemplo:

- `POST /api/candidates`
- `GET /api/candidates/{id}`
- `POST /api/jobs`
- `POST /api/selection/match`
- `POST /api/leads`
- `GET /api/analytics/dashboard`

Cada endpoint debe validarse en la capa de aplicación y respetar contratos claros. Esto favorece:

- integración con la landing page,
- futura administración interna,
- dashboards y procesos ETL,
- evolución del sistema sin rotura.

---

## 9. Seguridad y cumplimiento

Nexova maneja datos personales de candidatos y profesionales. Por tanto, el backend debe considerar:

- validación estricta de entradas,
- protección de confidencialidad,
- almacenamiento seguro de información sensible,
- control de acceso para el equipo interno,
- trazabilidad de acciones y auditoría,
- cumplimiento con normativa de protección de datos.

En una etapa inicial, esto puede implementarse con buenas prácticas dentro del monolito: roles, middleware de autenticación, logs y segmentación de acceso.

---

## 10. Observabilidad y calidad

Aunque el sistema empiece como monolito, debe construir desde el inicio con trazabilidad:

- logs estructurados,
- métricas de rendimiento,
- salud del sistema,
- tiempos de respuesta por módulo,
- contador de leads,
- métricas de matching y validación,
- monitoring de errores en integración IA.

Esto permite crecer sin perder control del sistema cuando el volumen y la complejidad aumenten.

---

## 11. Plan de evolución recomendado

La evolución sugerida es la siguiente:

### Fase 1: monolito modular inicial
- landing page + formulario de talento,
- backend con API REST,
- base de datos relacional,
- módulos de candidatos y leads,
- validaciones y almacenamiento.

### Fase 2: IA y matching
- módulo de parseo de CV,
- scoring y ranking,
- integración con servicio IA,
- mejora de métricas y analítica.

### Fase 3: crecimiento controlado
- si la empresa crece significativamente, se extraen módulos cuyas cargas o lógicas lo justifiquen,
- sin necesidad de reescribir el sistema completo,
- manteniendo la parte de dominio como base estable.

Esto se conoce como evolución modular controlada: no se divide por anticipación, sino por necesidad real.

---

## 12. Conclusión

La arquitectura más adecuada para Nexova es un monolito modular con principios de arquitectura hexagonal, porque refleja la realidad del negocio y del proyecto.

Es la opción más acertada porque:

- responde a un negocio de tamaño medio y operativa clara,
- reduce complejidad innecesaria,
- facilita el desarrollo de IA para screening de candidatos,
- mantiene un dominio de talento bien definido,
- permite crecer sin necesidad de dividir el sistema prematuramente,
- y prepara la solución para escalar de forma ordenada si la empresa aumenta su demanda o su base de procesos.

En otras palabras: no se trata de elegir la arquitectura “más moderna”, sino la que mejor encaja con el problema real de Nexova y con el momento de su evolución.
