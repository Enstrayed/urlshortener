#! /bin/bash

echo "IMPORTANT! You must have node & npm installed on the host first!"
cd ./backend
npm install
mv authorization.example.json authorization.json
cd ..
echo "Done; modify docker-compose.yml to your liking then start"