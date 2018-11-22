FROM node:8
WORKDIR /usr/src/app
COPY . .
RUN npm install xmlhttprequest socket.io underscore
CMD [ "node", "app.js" ]
