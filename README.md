
# Adoptaunpeludo

## Doucmentación:
https://backend.adoptaunpeludo.com/api/docs

## Instalacion

1. Clonar el repo, movernos al directorio e instalar las depencencias:

```
git clone https://github.com/Adoptaunpeludo/backend.git
cd backend
npm i
```

2. Copiar o renombrar el archivo .env.template y configurar con datos propios

```
NODE_ENV=development

PORT=3000

DB_PASSWORD=1234
DB_NAME=AUP-db
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres

JWT_SEED=secret

DATABASE_URL="postgresql://postgres:1234@localhost:5432/AUP-db"
```

3. Levantar base de datos postgresql con docker si es necesario

```
  docker compose up -d
```

4. Arrancar la aplicacion en desarrollo

```
  npm run dev
```
