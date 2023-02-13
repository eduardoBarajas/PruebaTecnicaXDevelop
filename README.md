# PruebaTecnicaXDevelop
Es un servicio REST básico con NodeJS para realizar operaciones CRUD sobre una base de datos de usuarios, donde se utiliza el framework Express y el ORM Sequelize.

## Version de prueba
La app se encuentra hospedada en una maquina virtual en Linode, para acceder a la app ingresar hacer [click aqui](https://139.144.31.231:3000/)


### Archivo de configuracion ENV
La app necesita de un archivo .env que debe encontrarse en la raiz, el archivo debe contener los siguientes campos:
> POSTGRES_USER=""
> POSTGRES_PWD=""
> POSTGRES_PORT=""
> POSTGRES_DB=""
> POSTGRES_ADDR=""
> ENV="DEV"

# Pasos para preparar el ambiente en Ubuntu 22.04

### Dependencias

1. Postgres 14
2. Node.js >= 16

### Instalacion de postgres
> apt update
> apt install postgresql postgresql-contrib -y 
> systemctl enable postgresql.service; service postgresql start
> service postgresql status 

### Creacion usuario
> su postgres
> psql postgres
> CREATE ROLE prueba_tecnica_user LOGIN PASSWORD '@Prueba123';
> CREATE DATABASE prueba_tecnica_xdevelop WITH OWNER = prueba_tecnica_user;

### Configuracion conexion remota
> nano /etc/postgresql/14/main/pg_hba.conf

host    all             all              0.0.0.0/0                 scram-sha-256

> nano /etc/postgresql/14/main/postgresql.conf

listen_addresses = '*'

### Instalacion Node

> sudo apt install nodejs

> sudo apt install npm

### Creacion de tabla de usuarios

La app se sincroniza con la bd cada que se inicia, por default se sincronizara cuando ocurran cambios en la tabla de usuarios.

Si se quiere crear a mano la tabla es de la siguiente forma.
```
CREATE TABLE public."Users" (
	id serial4 NOT NULL,
	nombre varchar(255) NOT NULL,
	apellido varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	img_perfil varchar(255),
	pass varchar(255) NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	CONSTRAINT "Users_email_key" UNIQUE (email),
	CONSTRAINT "Users_pkey" PRIMARY KEY (id)
);
```
