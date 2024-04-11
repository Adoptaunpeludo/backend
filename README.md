
# Adoptaunpeludo

## Documentación API Swagger:

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
NODE_ENV=<development o production>

PORT=<puerto del backend>

# Postrgresql DB
DB_PASSWORD=<password de la base de datos postgres>
DB_NAME=<nombre de la base de datos>
DB_HOST=<host de la base de datos>
DB_PORT=<puerto donde está arrancada la base de datos>
DB_USERNAME=<nombre de usuario para acceder a la base de datos>
DATABASE_URL=postgresql:<url a la base de datos para desarrollo local>
DOCK_DATABASE_URL=<url a la base de datos en produccion lanzada con Docker>

# JWT
JWT_SEED=<seed para los tokens JWT>

# EMAIL
MAIL_SERVICE=gmail
MAILER_EMAIL=<direccion de correo desde donde se mandarán los emails>
MAILER_SECRET_KEY=<key de gmail asociada al email desde donde se mandarán los emails>

# Web Service
WEBSERVICE_URL=<url a la web en produccion para la generación de links en los emails>

# RabbitMQ
RABBITMQ_USER=<usuario de rabbitmq>
RABBITMQ_PASS=<password de rabbitmq>
DOCK_RABBITMQ_URL=amqp:<url de rabbitmq>
RABBITMQ_URL=<url para conectar a rabbitmq>

# AWS Config
AWS_ACCESS_KEY_ID=<id de aws para el servicio de bucket>
AWS_SECRET_ACCESS_KEY=<key de aws para el servicio de bucket>
AWS_REGION=<region de aws donde está el bucket>
AWS_BUCKET=<nombre del bucket>
AWS_BUCKET_URL=<url del bucket>

# Websocket Server
WS_SERVER_PORT=<puerto del servidor de websocket (notification-service)>

# Assistant
ASSISTANT_PORT=<puerto del asistente de IA>
SUPABASE_URL=<url a la base de datos de supabase>
SUPABASE_PRIVATE_KEY=<key privada de supabase>
OPENAI_API_KEY=<key de la API de OpenAI>
MONGO_DB_URL=<url a la base de datos de mongodb atlas donde se almacenará el historial de conversaciones con el asistente>
```

3-a. Para iniciar la API y todos los microservicios todas las variables de entorno anteriores son necesarias, solo es necesario ejecutar el siguiente comando:
( Esto descargará las últimas imagenes de cada servicio y arrancará los contenedores necesarios para que la aplicación funcione)

```
  docker compose up -d
```

3-b. Si solo se quisiera iniciar la API sin los distintos servicios es necesario sincronizar las migraciones de prisma con la base de datos postgresql y luego arrancar la API:
**NOTA**: El docker-compose.yml está configurado para arrancar la API junto con un contenedor de RabbitMQ, las bases de datos y los microservicios necesarios
si solo se quiere arrancar la API es necesario **minimo** una base de datos postgresql con la configuración del archivo .env asociada a la misma

```
npx prisma migrate dev
npm run dev
```
