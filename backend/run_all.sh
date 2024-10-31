#!/bin/bash

# Run each script in the correct directory
echo "Running all scripts to build and run Docker images with slight delays..."

# Run UserService docker_build.sh in the UserService directory
(
  cd ./UserService || exit
  bash docker_build.sh &
)
sleep 5
PID1=$!
echo "Started UserService/docker_build.sh with PID $PID1"

# Run ImagetoVideoService docker_build.sh in the ImagetoVideoService directory
(
  cd ./ImagetoVideoService || exit
  bash docker_build.sh &
)
sleep 5
PID2=$!
echo "Started ImagetoVideoService/docker_build.sh with PID $PID2"

# Run VideotoGifService docker_build.sh in the VideotoGifService directory
(
  cd ./VideotoGifService || exit
  bash docker_build.sh &
)
PID3=$!
echo "Started VideotoGifService/docker_build.sh with PID $PID3"

# Wait for all scripts to complete
wait $PID1
echo "UserService/docker_build.sh completed."

wait $PID2
echo "ImagetoVideoService/docker_build.sh completed."

wait $PID3
echo "VideotoGifService/docker_build.sh completed."

echo "All Docker images built and containers started successfully."
