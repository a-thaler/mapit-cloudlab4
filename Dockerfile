FROM node:8
WORKDIR /usr/src/app
COPY . .
RUN npm install xmlhttprequest socket.io underscore
CMD [ "node", "app.js" ]

# Based on https://github.com/nishanttotla/DockerStaticSite
# For a normal index.html use this instead..
#FROM nginx:alpine
#COPY default.conf /etc/nginx/conf.d/default.conf
#COPY index.html /usr/share/nginx/html/index.html