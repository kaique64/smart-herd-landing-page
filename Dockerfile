FROM node:22.9.0-alpine3.19

WORKDIR /usr/app

COPY ./package*.json ./
RUN npm i

COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]
