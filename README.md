# Proyecto Prueba_Parcial

Este proyecto incluye un **backend en JS con node**, **frontend en React** y un entorno de **contenedores con Docker**.  

---

## 🚀 Requisitos previos
- [Docker] y [Docker Compose] instalados. Si ya tienen docker desktop ya viene incluido compose (por si acaso actualizar docker desktop)
- Node.js y npm para ejecutar el frontend.

---

## 📂 Estructura del proyecto
Prueba_Parcial/
- backend/ # Código del backend (Sevicios, Admin, Consultas y Usuarios)
- FrontEnd/ # Interfaces en React (UI Admin y hospitales)
- docker/ # Archivos de configuración Docker


## Configuracion Inicial

### Node y React
- Hay que ir por cada carpeta e ir haciendo la instalación "npm install" para que se genere node modules y las dependencias esto se hace tanto en el backend para cada servicio de node y de la misma forma en la carpeta frontend para cada interfaz 

### Contenedores docker

- Copiar el archivo de ejemplo .yml --> cp docker-compose.example.yml docker-compose.yml
- Levantar contenedores: deben estar en la terminal desde la carpeta /docker -> docker-compose up -d --build (si no funciona probar sin el guion -> docker compose up -d --build)
- Tal vez si se demore un poco en descargar las images desde internet y creando los contenedores
- En docker desktop se podrán ver los contenedores, pueden apagar algunos contendores para que no consuma recursos de su computadora, los necesarios para la base de datos es master, hospitalA, hospitalB

<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/21a80592-73e7-46b1-8bdd-9e0f475d307d" />

### Base de datos

- Desde a terminal ingresar al contenedor MYSQL -> docker exec -it master mysql -u root -p
- La contraseña es root123 la cual se define en el archivo .yml

#### Dar perimisos
Ejecutar en la base de datos master -> show master status (si el resultado es empty, ralizar lo siguiente)
 - Ejecutar en cada base de datos lo siguiente, ojo desde bash -> chmod 644 /etc/alternatives/my.cnf
 - Lo mismo para los otros contenedores -> docker exec -it replica-consultas mysql -u root -p 
 - Volver a master y verificar que devulva algo el comando -> show master status
 - En master dar privilegios copiando lo siguiente:

```md
CREATE USER 'repl_user'@'%' IDENTIFIED BY 'repl_pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
FLUSH PRIVILEGES;
```

- Ahora entrar en el contenedor de replica-consultas (no en la master) y ejecutar lo siguiente:

```md

CHANGE MASTER TO
  MASTER_HOST='master',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='repl_pass',
  MASTER_LOG_FILE='mysql-bin.000001', -- Este valor depende de lo que le salga en la primera columna del comando show master status, por lo general es el que está puesto<br>
  MASTER_LOG_POS=  328;  -- el valor depende del master en la segunda columna
START SLAVE;
```

- Ahora si pueden entrar a la base de datos master y ejecutar el siguiente escript solo copiando y pegando, si ya habian creado su base de datos pueden borrar para que se replique en el slave, tengan en cuenta que se borrá todo, hay otro proceso pero es mas laborioso de explicar jaja (Si no entendieron algo de lo anterior pueden escribirme :))

=== Script ===

```sql
CREATE DATABASE hospital_db;
USE hospital_db;

CREATE TABLE centros_medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(150) NOT NULL
);

CREATE TABLE especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','MEDICO') DEFAULT 'MEDICO',
    is_account_verified BOOLEAN DEFAULT 0,
    verify_otp VARCHAR(6) DEFAULT '',
    verify_otp_expire_at BIGINT DEFAULT 0,
    reset_otp VARCHAR(6) DEFAULT '',
    reset_otp_expire_at BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad_id INT,
    id_centro INT,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id),
    FOREIGN KEY (id_centro) REFERENCES centros_medicos(id)
);

CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion TEXT,
    medico_id INT,
    paciente_nombre VARCHAR(100),
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
);

CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    salario DECIMAL(10,2),
    id_centro INT,
    FOREIGN KEY (id_centro) REFERENCES centros_medicos(id)
);

ALTER TABLE medicos
ADD COLUMN user_id INT NOT NULL AFTER id,
ADD CONSTRAINT fk_medicos_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```


- Pueden verificar entrando en hospitalA y hospitalB que se haya creado también la base de datos

