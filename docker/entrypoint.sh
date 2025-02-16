#!/bin/bash

echo "Preparing test environment"

# Get the user email and user password from env
USER_EMAIL=${USER_EMAIL:-"test1@test.com"}
USER_PASSWORD=${USER_PASSWORD:-"test123"}
USER_POD=${USER_POD:-"test1"}

PORT=${PORT:-"3000"}
BASE_URL=${BASE_URL:-"http://localhost:3000"}

# Create a json file with the user email and password
echo "Creating user file"
echo "[{\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\",\"pods\":[{\"name\":\"${USER_POD}\"}]}]" > /config/users.json

# Start solid server
echo "Starting Solid server"
node bin/server.js -c /config/config.json -f /data --baseUrl ${BASE_URL} --seedConfig /config/users.json -p ${PORT}
