# EMPRE_SA

clonar con todos los submodulos: 
´´git clone --recurse-submodules -j8 https://github.com/Wilber1987/EMPRE_SA.git ´´

clonar solo sub modulos:
´´git submodule update --init --recursive´´
git submodule update --init --remote


configuracion de modulos

[submodule "UI/wwwroot/WDevCore"]
	path = UI/wwwroot/WDevCore
	url = https://github.com/Wilber1987/WDevCore
[submodule "CAPA_DATOS"]
	path = CAPA_DATOS
	url = https://github.com/Wilber1987/CAPA_DATOS.git


git submodule update --remote
entonces

git commit && git push


push de submodule
git push origin HEAD:main

credenciales de azure y outlook: datos empresa: 
correo: empresociedadanonima@outlook.com
password: villagui24
cel: 85777676

ELIMINAR DATOS DE PRUEBA: 

delete from Detail_Prendas_Vehiculos;
delete from Detail_Prendas;
DELETE from Detalle_Factura_Recibo;
DELETE from Tbl_Cuotas;
DELETE from Transaction_Contratos;
DELETE  from Catalogo_Clientes where codigo_cliente  < 4000;
delete from Detail_Movimiento;
delete from  Transaction_Movimiento;
delete from Detalle_Factura_Recibo;
delete from facturacion.Transaccion_Factura;
delete from facturacion.Detalle_Factura;
delete from facturacion.Tbl_Factura;
