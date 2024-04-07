
# Adoptaunpeludo

## Documentación:
https://backend.adoptaunpeludo.com/api/docs

## Descripción

El backend de adoptaunpeludo.com se compone de un a API y varios micro servicios:

[**API**](https://github.com/Adoptaunpeludo/backend):
- Auth: Endpoints relacionados con la autentificación y autorización de usuarios sobre los diferentes recursos a los que tienen acceso.
- Users: Endpoints relacionados con el CRUD de usuarios.
- Animals: Endpoints relacionados con el CRUD de animales.
- Chats: Endopints relacionados con la obtención de información acerca de los diferentes chats que tengan los usuarios.

[**Notification-service**](https://github.com/Adoptaunpeludo/notification-service):
- Servidor de websocket encarcado de las notificaciones en tiempo real y de la gestión de las private rooms y los mensajes de chats entre los usuarios.

[**Email-service**](https://github.com/Adoptaunpeludo/email-service):
- Servicio encargado de enviar emails a los usuarios como el email de validación, de recuperación de contraseña o notificaciones cuando el usuario está offline.

[**Chatbot-service**](https://github.com/Adoptaunpeludo/chatbot-service):
- Servicio encargado de la funcionalidad de Asistente de la web, utiliza un agente creado con LangChain que hace busquedas vectoriales en una Base de datos almacenada en Supabase y que previamente ha sido poblada con embeddings con la documentación de la Web para que así el Asistente pueda responder preguntas acerca de ella.

**NOTA:** Más información acerca de cada servicio en el link a su propio repositorio.



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
