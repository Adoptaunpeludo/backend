FROM nginx

RUN apt-get update && apt-get install -y \
software-properties-common && add-apt-repository "deb http://deb.debian.org/debian stretch-backports main" && \
apt-get update && apt-get install -y \
certbot python3-certbot-nginx

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
