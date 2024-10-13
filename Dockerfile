FROM node:22.9.0-alpine3.19

WORKDIR /usr/app

COPY . .
RUN npm i

EXPOSE 5000

CMD [ "npm", "start" ]
