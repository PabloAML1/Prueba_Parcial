# Imagen base oficial de Node
FROM node:18

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto donde corre el microservicio
EXPOSE 4000

# Comando para ejecutar el servicio
CMD ["node", "src/app.js"]
