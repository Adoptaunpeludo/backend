
# Adoptaunpeludo

## Documentación API Swagger:

https://backend.adoptaunpeludo.com/api/docs

## Descripción

Este repositorio contiene el backend para Adoptaunpeludo, una plataforma dedicada a la adopción de mascotas. El backend proporciona la lógica de negocio, la gestión de bases de datos y la interacción con servicios externos necesarios para el funcionamiento de la plataforma.

[**API**](https://github.com/Adoptaunpeludo/backend):
La API proporciona endpoints para:
- **Autenticación:** Registro, inicio de sesión y recuperación de contraseñas para usuarios.
- **Gestión de animales:** CRUD de animales, incluyendo la posibilidad de subir imágenes y buscar animales por diferentes criterios.
- **Gestión de usuarios:** CRUD de usuarios, incluyendo la posibilidad de subir imágenes y buscar usuarios por diferentes criterios.
- **Chat en tiempo real:** Envío y recepción de mensajes en los chats de adopción entre adoptantes y refugios.
- **Notificaciones:** Gestión de notificaciones, incluyendo la marcación como leídas y la eliminación.

[**Notification-service**](https://github.com/Adoptaunpeludo/notification-service):
- Servidor de websocket encarcado de las notificaciones en tiempo real y de la gestión de las private rooms y los mensajes de chats entre los usuarios.

[**Email-service**](https://github.com/Adoptaunpeludo/email-service):
- Servicio encargado de enviar emails a los usuarios como el email de validación, de recuperación de contraseña o notificaciones cuando el usuario está offline.

[**Chatbot-service**](https://github.com/Adoptaunpeludo/chatbot-service):
- Servicio encargado de la funcionalidad de Asistente de la web, utiliza un agente creado con LangChain que hace busquedas vectoriales en una Base de datos almacenada en Supabase y que previamente ha sido poblada con embeddings con la documentación de la Web para que así el Asistente pueda responder preguntas acerca de ella.

[**NOC-service**](https://github.com/Adoptaunpeludo/noc-service):
- Servicio de monitorización y gestion de errores.

**NOTA:** Más información acerca de cada servicio en el link a su propio repositorio.

## Funcionalidades

- **Autenticación de usuarios:** Permite a los usuarios registrarse, iniciar sesión y recuperar sus contraseñas. Se utilizan tokens de acceso (accessToken) y tokens de actualización (refreshToken) almacenados en cookies para mantener la sesión del usuario.
  
- **Gestión de animales:** Los usuarios pueden ver, crear, actualizar y eliminar información sobre los animales disponibles para adopción.
  
- **Comunicación en tiempo real:** Se proporciona un sistema de chat en tiempo real entre adoptantes y refugios para facilitar la comunicación y la coordinación durante el proceso de adopción.
  
- **Envío de notificaciones:** Los usuarios reciben notificaciones en tiempo real sobre eventos importantes, como mensajes nuevos en el chat o cambios en el estado de los animales.
  
- **Servicios externos:** Integración con servicios externos como RabbitMQ para la mensajería, AWS S3 para el almacenamiento de imágenes y servicios de correo electrónico para la comunicación con los usuarios.

## Middleware

- **Autenticación JWT:** Middleware para validar tokens de acceso (accessToken) y actualizarlos utilizando tokens de actualización (refreshToken) almacenados en cookies.
  
- **Validación de datos:** Utiliza `class-validator` para validar los datos de entrada de las solicitudes y garantizar su integridad.
  
- **Manejo de errores:** Implementa un middleware para capturar y gestionar errores de manera centralizada, proporcionando respuestas adecuadas al cliente.
  
- **Seguridad:** Incluye medidas de seguridad como la protección contra ataques de inyección de código y la configuración adecuada de encabezados HTTP para prevenir vulnerabilidades.
  
## Servicios

- **Base de datos PostgreSQL:** Almacena la información de usuarios, animales, chats y más, utilizando Prisma como ORM para la comunicación.
  
- **RabbitMQ:** Sistema de mensajería para la comunicación asincrónica entre microservicios, utilizado para el envío de notificaciones en tiempo real.
  
- **AWS S3:** Almacenamiento en la nube para las imágenes de los animales, permitiendo un acceso rápido y seguro a los recursos multimedia.
  
- **Servicios de correo electrónico:** Integración con servicios de correo electrónico para el envío de notificaciones y comunicación con los usuarios.
  
## Tecnologías

- **Node.js:** Plataforma de ejecución para el servidor.
  
- **Express.js:** Framework web para Node.js que facilita la creación de API RESTful.
  
- **Prisma:** ORM para la comunicación con la base de datos PostgreSQL.
  
- **JWT:** Para la autenticación y autorización de usuarios, con tokens de acceso y actualización.
  
- **RabbitMQ:** Sistema de mensajería para la comunicación asincrónica entre servicios.
  
- **Docker:** Para la contenerización de la aplicación y la gestión de los servicios, asegurando la portabilidad y escalabilidad del sistema.
  
- **AWS S3:** Servicio de almacenamiento en la nube para la gestión de imágenes de animales, garantizando la disponibilidad y durabilidad de los recursos multimedia.

## Arquitecturas Utilizadas

### 1. Arquitectura DDD (Domain-Driven Design):
- La estructura de carpetas está organizada en dominios (carpeta `domain`) que contienen los modelos de datos, los DTOs y las interfaces que representan el núcleo de la lógica de negocio.
- Se utilizan adaptadores en la capa de infraestructura para interactuar con servicios externos como RabbitMQ, AWS S3, servicios de correo electrónico, etc.
- La separación entre las capas de presentación, dominio y de infraestructura sigue los principios de DDD, lo que permite una mejor organización y mantenimiento del código.

### 2. Arquitectura Hexagonal:
- Los adaptadores actúan como puertos que permiten la comunicación entre los servicios externos y las capas internas de la aplicación.
- Los casos de uso y las entidades del dominio representan el núcleo de la aplicación y son independientes de los detalles de implementación de la infraestructura externa.

### 3. Arquitectura de Microservicios:
- La aplicación está diseñada para una arquitectura de microservicios, ya que hay servicios independientes para la base de datos (PostgreSQL), RabbitMQ, servicios de correo electrónico, etc.
- La comunicación entre estos servicios se realiza de forma asincrónica a través de RabbitMQ, lo que favorece la escalabilidad y la robustez del sistema.
  
## Dependencias
- `express`: Framework web para Node.js.
- `jsonwebtoken`: Implementación de JSON Web Tokens para autenticación.
- `prisma`: ORM para la comunicación con la base de datos, siguiendo los principios de DDD.
- `bcryptjs`: Librería para el hash de contraseñas, garantizando la seguridad de las credenciales de los usuarios.
- `dotenv`: Carga de variables de entorno desde archivos `.env`, facilitando la configuración y la gestión de entornos.
- `nodemailer`: Librería para el envío de correos electrónicos, utilizado para la comunicación con los usuarios.
- `amqplib`: Cliente RabbitMQ para Node.js, permitiendo la comunicación asincrónica entre microservicios.

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
MAIL_SERVICE=<servicio de email>
MAILER_EMAIL=<direccion de correo desde donde se mandarán los emails>
MAILER_SECRET_KEY=<key o password asociada al email desde donde se mandarán los emails>

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
