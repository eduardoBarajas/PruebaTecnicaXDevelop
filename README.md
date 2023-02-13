# PruebaTecnicaXDevelop
Es un servicio REST básico con NodeJS para realizar operaciones CRUD sobre una base de datos de usuarios, donde se utiliza el framework Express y el ORM Sequelize.


# Guia para crear contenedor en docker

### Dependencias

1. libncurses5
2. unixodbc
3. unixodbc-dev
4. [clientsdk.4.10.FC15.linux-x86_64 (https://firebasestorage.googleapis.com/v0/b/codens-18ad2.appspot.com/o/clientsdk.4.10.FC15.linux-x86_64.tar?alt=media)]
5. go get github.com/alexbrainman/odbc@for_issue_88

### Build de la imagen

Estando en la carpeta raiz del proyecto ejecutar la funcion 
> docker build --build-arg _env="dev" . --label "docker-api-dev" -t img-docker-api-inventario-dev

### Ejecutar docker

> docker run -p 4000:8080 -d --name docker-api-inventario img-docker-api-inventario-dev

### Probar conexion con base de datos bd_finanzas

Entrar al docker por medio de ssh
> docker exec -it [id-contenedor] /bin/bash

Una vez dentro asignar las siguientes variables de entorno 

> export INFORMIXDIR=/opt/IBM/informix
> export LD_LIBRARY_PATH=$INFORMIXDIR/lib/esql
> export ODBCINI=/etc/odbc.ini

Y ejecutar el siguiente comando que hara una consulta de prueba

> echo "SELECT FIRST 1 DBINFO('dbname') FROM systables" | /usr/bin/isql -v informixdsn USUARIO_DB PASSWORD


### Preparar bases de datos

Para poder ejecutar el api es necesario contar con una base de datos en informix [bd_finanzas] y otra en postgres [bd_inventario]

Para la la bd inventario es necesario crear un schema con el nombre de mgrinv y la siguiente tabla de activo fijo

```
CREATE TABLE mgrinv.activofijo (
	nocontrol decimal(8,0) NOT NULL,
	cuentaid decimal(3,0) NOT NULL,
	ubicacionid decimal(10,0),
	tipodearticulo char(7) NOT NULL,
	programaid decimal(5,0),
	ordenid char(12) NOT NULL,
	progasig char(4),
	descripcion char(50),
	marca char(12),
	noserie char(32),
	cantidad smallint,
	costoadq money,
	fechaadq date,
	esnuevousado char(1),
	esequipotransito char(1),
	deptoproc char(4),
	fechadebaja date,
	clavebaja char(1),
	deptobaja decimal(5,0),
	cuentabaja decimal(3,0),
	fechacaptura date,
	dolares money,
	folio decimal(7,0),
	poliza decimal(10,0) DEFAULT 0.0000000000,
	esactualizado decimal(1,0),
	progubicacion decimal(5,0),
	fechademodificacion date,
	PRIMARY KEY (nocontrol)
);

CREATE UNIQUE INDEX ON mgrinv.activofijo (nocontrol);
CREATE INDEX ON mgrinv.activofijo (ubicacionid,programaid);
CREATE UNIQUE INDEX af_comb1 ON mgrinv.activofijo (nocontrol,cuentaid,programaid,tipodearticulo);
CREATE INDEX af_comb2 ON mgrinv.activofijo (programaid,cuentaid);
CREATE UNIQUE INDEX af_comb3 ON mgrinv.activofijo (nocontrol,cuentaid,programaid);
CREATE INDEX af_cuentaid ON mgrinv.activofijo (cuentaid);
CREATE INDEX af_programaid ON mgrinv.activofijo (programaid);
CREATE INDEX af_tipodearticulo ON mgrinv.activofijo (tipodearticulo);
```