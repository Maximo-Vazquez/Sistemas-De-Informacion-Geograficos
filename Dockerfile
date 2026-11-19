# Etapa 1: compila el frontend React (Vite). La imagen final no necesita Node.
FROM node:24-alpine AS frontend-build
WORKDIR /frontend
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# Etapa 2: Django local con los estáticos compilados.
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.local

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Assets de Vite con su manifest (lo lee el tag {% vite_assets %}).
COPY --from=frontend-build /frontend/dist/ /app/static/frontend/

RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload", "--skip-frontend-build"]
