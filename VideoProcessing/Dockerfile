FROM node

WORKDIR /app/Processing

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5002

CMD ["node", "server.js"]

# Build the Docker image
docker build -t video-processing-service .

# docker run -p 5002:5002 video-processing-service
# docker run -p 5002:5002 video-processing-service