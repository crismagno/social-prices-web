FROM node:16.20.0

WORKDIR /app

RUN apt-get update && \
    apt-get install vim -y 

# VOLUME ./social-prices:/usr/src/app

CMD [ "npm", "run", "dev" ]

EXPOSE 3000