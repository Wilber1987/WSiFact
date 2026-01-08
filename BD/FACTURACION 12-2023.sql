-- DROP SCHEMA facturacion;

CREATE SCHEMA facturacion;
-- EMPRE_SA.facturacion.Cat_Almacenes definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Cat_Almacenes;

CREATE TABLE EMPRE_SA.facturacion.Cat_Almacenes (
	Id_Almacen int IDENTITY(1,1) NOT NULL,
	Descripcion nvarchar(500) COLLATE Modern_Spanish_CI_AS NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_Cat_Almacenes PRIMARY KEY (Id_Almacen)
);


-- EMPRE_SA.facturacion.Cat_Categorias definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Cat_Categorias;

CREATE TABLE EMPRE_SA.facturacion.Cat_Categorias (
	Id_Categoria int IDENTITY(1,1) NOT NULL,
	Descripcion varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK__Cat_Cate__CB903349180A6C52 PRIMARY KEY (Id_Categoria)
);


-- EMPRE_SA.facturacion.Cat_Marca definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Cat_Marca;

CREATE TABLE EMPRE_SA.facturacion.Cat_Marca (
	Id_Marca int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Descripcion nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK__Cat_Marc__28EFE28A4F56618E PRIMARY KEY (Id_Marca)
);


-- EMPRE_SA.facturacion.Cat_Proveedor definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Cat_Proveedor;

CREATE TABLE EMPRE_SA.facturacion.Cat_Proveedor (
	Id_Proveedor int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(500) COLLATE Modern_Spanish_CI_AS NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	Datos_Proveedor nvarchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_Cat_Proveedor PRIMARY KEY (Id_Proveedor)
);


-- EMPRE_SA.facturacion.Lotes definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Lotes;

CREATE TABLE EMPRE_SA.facturacion.Lotes (
	Id_Transaccion int IDENTITY(1,1) NOT NULL,
	Descripcion varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Fecha datetime NULL,
	Id_Usuario int NULL,
	Id_Tipo_transaccion int NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK__Lotes__BEDEB8A5F7EEF521 PRIMARY KEY (Id_Transaccion)
);


-- EMPRE_SA.facturacion.Tbl_Factura definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Tbl_Factura;

CREATE TABLE EMPRE_SA.facturacion.Tbl_Factura (
	Id_Factura int IDENTITY(1,1) NOT NULL,
	Tipo nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Concepto nvarchar(300) COLLATE Modern_Spanish_CI_AS NULL,
	Serie nvarchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Forma_Pago varchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	Direccion_Envio varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Id_Cliente int NULL,
	Id_Sucursal int NULL,
	Fecha datetime NULL,
	Fecha_Vencimiento datetime NULL,
	Observaciones nvarchar(500) COLLATE Modern_Spanish_CI_AS NULL,
	Id_Usuario int NULL,
	Estado varchar(20) COLLATE Modern_Spanish_CI_AS NULL,
	Sub_Total float NOT NULL,
	Iva float NULL,
	Tasa_Cambio float NULL,
	Total float NULL,
	CONSTRAINT PK_Tbl_Factura_Id_Factura  PRIMARY KEY (Id_Factura)
);


-- EMPRE_SA.facturacion.Transaccion_Factura definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Transaccion_Factura;

CREATE TABLE EMPRE_SA.facturacion.Transaccion_Factura (
	id_factura int IDENTITY(1,1) NOT NULL,
	tipo nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	concepto nvarchar(300) COLLATE Modern_Spanish_CI_AS NULL,
	tasa_cambio float NULL,
	total float NULL,
	id_cliente int NULL,
	id_sucursal int NULL,
	fecha datetime NULL,
	id_usuario int NULL,
	Factura_contrato nvarchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	estado varchar(20) COLLATE Modern_Spanish_CI_AS NULL,
	no_factura nvarchar(50) COLLATE Modern_Spanish_CI_AS DEFAULT '0' NOT NULL,
	subtotal float DEFAULT 0 NOT NULL,
	iva float DEFAULT 0 NULL,
	CONSTRAINT PK__Transacc__6C08ED533CB32B31 PRIMARY KEY (id_factura)
);


-- EMPRE_SA.facturacion.Cat_Producto definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Cat_Producto;

CREATE TABLE EMPRE_SA.facturacion.Cat_Producto (
	Id_Producto int IDENTITY(1,1) NOT NULL,
	Descripcion varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Id_Categoria int NULL,
	Id_Marca int NULL,
	CONSTRAINT PK__Cat_Prod__2085A9CFB3FED8A5 PRIMARY KEY (Id_Producto),
	CONSTRAINT FK_Cat_Producto_Cat_Categorias FOREIGN KEY (Id_Categoria) REFERENCES EMPRE_SA.facturacion.Cat_Categorias(Id_Categoria),
	CONSTRAINT fk_catalogo_productos_catalogo_marcas FOREIGN KEY (Id_Marca) REFERENCES EMPRE_SA.facturacion.Cat_Marca(Id_Marca)
);


-- EMPRE_SA.facturacion.Detalle_Factura definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Detalle_Factura;

CREATE TABLE EMPRE_SA.facturacion.Detalle_Factura (
	Id_DetalleFactura int IDENTITY(1,1) NOT NULL,
	Id_Factura int NULL,
	Id_Producto int NULL,
	Cantidad float NULL,
	Precio_Venta float NULL,
	Iva float NULL,
	Total float NULL,
	Id_Lote int NULL,
	Descuento float NULL,
	Sub_Total float NULL,
	CONSTRAINT PK__Detalle___2874944CB4C134B9 PRIMARY KEY (Id_DetalleFactura),
	CONSTRAINT FK_Detalle_Factura_Cat_Producto FOREIGN KEY (Id_Producto) REFERENCES EMPRE_SA.facturacion.Cat_Producto(Id_Producto),
	CONSTRAINT Tblion_factura_detalle_transaccion_factura FOREIGN KEY (Id_Factura) REFERENCES EMPRE_SA.facturacion.Tbl_Factura(Id_Factura)
);


-- EMPRE_SA.facturacion.Tbl_Compra definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Tbl_Compra;

CREATE TABLE EMPRE_SA.facturacion.Tbl_Compra (
	Id_Compra int IDENTITY(1,1) NOT NULL,
	DatosCompra nvarchar(MAX) COLLATE Modern_Spanish_CI_AS NULL,
	Id_Proveedor int NULL,
	Fecha datetime NULL,
	Tasa_Cambio float NULL,
	Moneda nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	Sub_Total float NULL,
	Iva float NULL,
	Total float NULL,
	Estado nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_Tbl_Compra PRIMARY KEY (Id_Compra),
	CONSTRAINT FK_Tbl_Compra_Cat_Proveedor FOREIGN KEY (Id_Proveedor) REFERENCES EMPRE_SA.facturacion.Cat_Proveedor(Id_Proveedor)
);


-- EMPRE_SA.facturacion.Detalle_Compra definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Detalle_Compra;

CREATE TABLE EMPRE_SA.facturacion.Detalle_Compra (
	Id_Detalle_Compra int IDENTITY(1,1) NOT NULL,
	Id_Compra int NULL,
	Id_Producto int NULL,
	Cantidad int NULL,
	Precio_Unitario float NULL,
	Total float NULL,
	Presentacion nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	CONSTRAINT PK_Detalle_Compra PRIMARY KEY (Id_Detalle_Compra),
	CONSTRAINT FK_Detalle_Compra_Cat_Producto FOREIGN KEY (Id_Producto) REFERENCES EMPRE_SA.facturacion.Cat_Producto(Id_Producto),
	CONSTRAINT FK_Detalle_Compra_Tbl_Compra FOREIGN KEY (Id_Compra) REFERENCES EMPRE_SA.facturacion.Tbl_Compra(Id_Compra)
);


-- EMPRE_SA.facturacion.Tbl_Lotes definition

-- Drop table

-- DROP TABLE EMPRE_SA.facturacion.Tbl_Lotes;

CREATE TABLE EMPRE_SA.facturacion.Tbl_Lotes (
	Id_Lote int IDENTITY(1,1) NOT NULL,
	Id_Producto int NULL,
	Precio_Venta float NULL,
	Precio_Compra float NULL,
	Cantidad_Inicial int NULL,
	Cantidad_Existente int NULL,
	Fecha_Ingreso datetime NULL,
	Id_Almacen int NULL,
	Id_Detalle_Compra int NULL,
	CONSTRAINT PK_Tbl_Lotes PRIMARY KEY (Id_Lote),
	CONSTRAINT FK_Tbl_Lotes_Cat_Almacenes FOREIGN KEY (Id_Almacen) REFERENCES EMPRE_SA.facturacion.Cat_Almacenes(Id_Almacen),
	CONSTRAINT FK_Tbl_Lotes_Detalle_Compra FOREIGN KEY (Id_Detalle_Compra) REFERENCES EMPRE_SA.facturacion.Detalle_Compra(Id_Detalle_Compra)
);


ALTER TABLE facturacion.Tbl_Factura 
ADD Id_Proveedor int null;


EXEC sp_RENAME 'facturacion.Tbl_Compra.DatosCompra', 'Datos_Compra', 'COLUMN';


ALTER TABLE Facturacion.Tbl_Lotes
ADD Lote NVARCHAR(255);

ALTER TABLE facturacion.Detalle_Compra
ADD SubTotal float;

ALTER TABLE facturacion.Detalle_Compra
ADD Iva float;

ALTER TABLE facturacion.Detalle_Compra
ALTER COLUMN Cantidad FLOAT; 

ALTER TABLE facturacion.Tbl_Lotes
ALTER COLUMN Cantidad_Inicial FLOAT; 

ALTER TABLE facturacion.Tbl_Lotes
ALTER COLUMN Cantidad_Existente FLOAT; 

ALTER TABLE facturacion.Cat_Proveedor
ADD Identificacion NVARCHAR(255);

ALTER TABLE facturacion.Tbl_Lotes
ADD Datos_Producto NVARCHAR(MAX);


ALTER TABLE facturacion.Tbl_Lotes
add  Id_Sucursal int; 

ALTER TABLE facturacion.Tbl_Lotes
add  Id_User int;

ALTER TABLE facturacion.Tbl_Factura
add  Id_Sucursal int;

ALTER TABLE facturacion.Tbl_Factura
add  Id_User int;

ALTER TABLE facturacion.Cat_Almacenes
add  Id_Sucursal int;

ALTER TABLE facturacion.Tbl_Compra
add  Id_Sucursal int; 

ALTER TABLE facturacion.Tbl_Compra
add  Id_User int; 