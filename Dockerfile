FROM node:lts-alpine

# Встановлення Python та необхідних залежностей для node-gyp
RUN apk --no-cache add python3 make g++

COPY . /bc-server
WORKDIR /bc-server

RUN npm install
RUN npm rebuild bcrypt --build-from-source

EXPOSE 3030

CMD ["npm", "run", "start:dev"]
