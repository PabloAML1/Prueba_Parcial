# Proyecto Prueba_Parcial

Este proyecto incluye un **backend en JS con node**, **frontend en React** y un entorno de **contenedores con Docker**.  

---

## 🚀 Requisitos previos
- [Docker] y [Docker Compose] instalados. Si ya tienen docker desktop ya viene incluido compose (por si acaso actualizar docker desktop)
- Node.js y npm para ejecutar el frontend.

---

## 📂 Estructura del proyecto
Prueba_Parcial/
├─ backend/ # Código del backend (Sevicios, Admin, Consultas y Usuarios)
├─ FrontEnd/ # Interfaces en React (UI Admin y hospitales)
├─ docker/ # Archivos de configuración Docker


## Configuracion Inicial

### Node y React
- Hay que ir por cada carpeta e ir haciendo la instalación "npm install" para que se genere node modules y las dependencias esto se hace tanto en el backend para cada servicio de node y
- de la misma forma en la carpeta frontend para cada interfaz 

### Contenedores docker

- Copiar el archivo de ejemplo .yml --> cp docker-compose.example.yml docker-compose.yml
- Levantar contenedores: deben estar en la terminal desde la carpeta /docker -> docker-compose up -d --build
- (si no funciona probar sin el guion -> docker compose up -d --build)
- (Tal vez si se demore un poco en descargar las images desde internet y creando los contenedores)
├─ En docker desktop se podrán ver los contenedores, pueden apagar algunos contendores para que no consuma recursos de su computadora, los necesarios para la base de datos es master, hospitalA, hospitalB

<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/21a80592-73e7-46b1-8bdd-9e0f475d307d" />

### Base de datos

- Desde a terminal ingresar al contenedor MYSQL -> docker exec -it master mysql -u root -p
- La contraseña es root123 la cual se define en el archivo .yml
- Ejecutar el siguiente escript solo copiando y pegando

=== Script ===

CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE centros_medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(150) NOT NULL
);

CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad_id INT,
    id_centro INT,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id),
    FOREIGN KEY (id_centro) REFERENCES centros_medicos(id)
);

CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    salario DECIMAL(10,2),
    id_centro INT,
    FOREIGN KEY (id_centro) REFERENCES centros_medicos(id)
);

CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion TEXT,
    medico_id INT,
    paciente_nombre VARCHAR(100),
    id_centro INT,
    FOREIGN KEY (medico_id) REFERENCES medicos(id),
    FOREIGN KEY (id_centro) REFERENCES centros_medicos(id)
);


## Cosas Por Hacer
- Servicio de Usuarios (Login Para los meéicos)
- Diseñar las interfaces (Si les da error en alguna parte del proyecto, y quieren seguir avanzando pueden hacer esta parte de las interfaces, haciendo un login o una tabla para las citas )
- Configuración de red, que sea mediante IPs
- Api gateway
- El  lunes o martes podemos presentar el avance y recibir retroalimentación del profe

