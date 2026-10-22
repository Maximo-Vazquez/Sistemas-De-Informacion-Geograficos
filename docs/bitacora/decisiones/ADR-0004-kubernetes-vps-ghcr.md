---
id: ADR-0004
titulo: Despliegue en Kubernetes (k3s) en VPS con imágenes en GHCR
estado: aceptada
fecha: 2026-10-22
---

## Contexto

La aplicación debe quedar publicada para la presentación y desplegarse de forma repetible. El equipo dispone de un VPS con k3s y de un NAS QNAP.

## Opciones consideradas

- Mantener ambos destinos.
- Solo el VPS con k3s.
- Solo el NAS QNAP.

## Decisión

Solo el VPS. El workflow `1-construir-imagen` publica la imagen en GHCR al crear un tag `v*`; `2-deploy-vps` (manual) resuelve el último tag, crea el secret `sig-runtime-credentials` y aplica `k8s/`. Se suma `0-calidad` (ruff, tests con Postgres, build del frontend y bitácora) en cada push y PR.

## Consecuencias

- Secrets necesarios en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `DJANGO_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- PostGIS y el servidor de mapas irán como manifiestos propios en `k8s/`.
