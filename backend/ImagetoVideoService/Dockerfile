# syntax=docker/dockerfile:1

FROM node:18
WORKDIR /app
COPY . .
RUN yarn install --production
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y ffmpeg
CMD ["node", "index.js"]
EXPOSE 7000