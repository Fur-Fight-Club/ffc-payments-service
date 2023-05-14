# Étape 1 : Utiliser une image de base légère avec Node.js
FROM node:18-alpine

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Étape 4 : Installer les dépendances de l'application
RUN npm install

# Étape 5 : Copier les fichiers source de l'application dans le conteneur
COPY . .

#RUN npm rebuild bcrypt --build-from-source

# Étape 7 : Build le projet
RUN npm run build

# Étape 8 : Exposer le port utilisé par l'application (par exemple, 3000)
EXPOSE 4004
EXPOSE 5432

# Étape 9 : Commande pour démarrer l'application
CMD [ "npm", "run", "start:prod" ]
