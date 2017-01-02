FROM node
ENV NPM_CONFIG_LOGLEVEL warn

MAINTAINER Steve Schmechel <shmakes@gmail.com>

LABEL Version="1.0"

WORKDIR /srv

COPY ./package.json app/
RUN cd app/ && npm install

COPY . app/

WORKDIR app
CMD ["npm", "start"]

EXPOSE 8786