# Image source
FROM node:18

# Docker working directory
WORKDIR /app

# Copying file into APP directory of docker
COPY package*.json .

# Then install the NPM module
RUN apt-get update && \
    apt-get install -y default-mysql-client

# Copy current directory to APP folder
COPY . .

EXPOSE 3000
EXPOSE 3306

CMD ["npm", "run", "start:dev"]