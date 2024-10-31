#!/bin/bash

# Variables
IMAGE_NAME="video-gif-service"
IMAGE_TAG="video-gif-service"
CONTAINER_NAME="video-gif-container"
DOCKERFILE_PATH="."
HOST_PORT=8001
CONTAINER_PORT=8001

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -f ./Dockerfile -t ${IMAGE_NAME}:${IMAGE_TAG} ${DOCKERFILE_PATH}

# Check if the image was built successfully
if [ $? -eq 0 ]; then
  echo "Docker image '${IMAGE_NAME}:${IMAGE_TAG}' built successfully."
else
  echo "Failed to build Docker image. Exiting."
  exit 1
fi

# Step 2: Run the Docker container
echo "Running Docker container..."
docker run -d --name ${CONTAINER_NAME} -p ${HOST_PORT}:${CONTAINER_PORT} ${IMAGE_NAME}:${IMAGE_TAG}

# Check if the container started successfully
if [ $? -eq 0 ]; then
  echo "Container '${CONTAINER_NAME}' is running on port ${HOST_PORT}."
else
  echo "Failed to start Docker container. Exiting."
  exit 1
fi
