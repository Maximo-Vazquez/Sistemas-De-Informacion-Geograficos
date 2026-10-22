# Etapa 1: compila el frontend React (Vite). La imagen final no necesita Node.
FROM node:24-alpine AS frontend-build
WORKDIR /frontend
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# Etapa 2: Django con Gunicorn.
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

# Etapa GIS (GeoDjango + PostGIS): agregar aquí
#   apt-get install -y --no-install-recommends gdal-bin libgdal-dev libgeos-dev libproj-dev
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Assets de Vite con su manifest (lo lee el tag {% vite_assets %}).
COPY --from=frontend-build /frontend/dist/ /app/static/frontend/

# collectstatic no usa la base ni secretos reales: la clave es solo para poder cargar settings.
RUN DJANGO_SECRET_KEY=build-collectstatic python manage.py collectstatic --noinput

RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
