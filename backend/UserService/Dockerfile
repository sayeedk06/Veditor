
FROM node:18
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "index.js"]
EXPOSE 8000