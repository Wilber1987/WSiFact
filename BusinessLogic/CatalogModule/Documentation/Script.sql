-- catalogos.Catalogo_Cambio_Divisa definition

-- Drop table

-- DROP TABLE catalogos.Catalogo_Cambio_Divisa;
create schema catalogos;
go

CREATE TABLE catalogos.Catalogo_Cambio_Divisa (
	id_cambio int IDENTITY(1,1) NOT NULL,
	fecha date NULL,
	valor_de_compra float NULL,
	valor_de_venta float NULL,
	Moneda varchar(250) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_cambioaldiadolar PRIMARY KEY (id_cambio)
);


-- catalogos.Catalogo_Nacionalidad definition

-- Drop table

-- DROP TABLE catalogos.Catalogo_Nacionalidad;

CREATE TABLE catalogos.Catalogo_Nacionalidad (
	id_nacionalidad int IDENTITY(1,1) NOT NULL,
	nombre nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	nacionalidad nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	ponderacion int NULL,
	puntaje int NULL,
	clasificacion nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_nacionalidades PRIMARY KEY (id_nacionalidad)
);


-- catalogos.Catalogo_Sucursales definition

-- Drop table

-- DROP TABLE catalogos.Catalogo_Sucursales;

CREATE TABLE catalogos.Catalogo_Sucursales (
	Id_Sucursal int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Descripcion nvarchar(500) COLLATE Modern_Spanish_CI_AS NULL,
	Direccion nvarchar(500) COLLATE Modern_Spanish_CI_AS NULL,
	id_municipio int NULL,
	CONSTRAINT PK_Catalogo_Sucursales PRIMARY KEY (Id_Sucursal)
);


-- catalogos.Catalogo_Departamento definition

-- Drop table

-- DROP TABLE catalogos.Catalogo_Departamento;

CREATE TABLE catalogos.Catalogo_Departamento (
	id_departamento int IDENTITY(1,1) NOT NULL,
	nombre nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	id_nacionalidad int NULL,
	ponderacion int NULL,
	puntaje int NULL,
	clasificacion nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_departamentos PRIMARY KEY (id_departamento),
	CONSTRAINT FK_Catalogo_Departamento_Catalogo_Nacionalidad FOREIGN KEY (id_nacionalidad) REFERENCES catalogos.Catalogo_Nacionalidad(id_nacionalidad)
);


-- catalogos.Catalogo_Municipio definition

-- Drop table

-- DROP TABLE catalogos.Catalogo_Municipio;

CREATE TABLE catalogos.Catalogo_Municipio (
	id_municipio int IDENTITY(1,1) NOT NULL,
	nombre nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	id_departamento int NULL,
	CONSTRAINT PK_municipio PRIMARY KEY (id_municipio),
	CONSTRAINT FK_municipio_departamentos FOREIGN KEY (id_departamento) REFERENCES catalogos.Catalogo_Departamento(id_departamento)
);