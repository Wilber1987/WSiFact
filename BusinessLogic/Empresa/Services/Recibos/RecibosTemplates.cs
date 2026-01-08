namespace CAPA_NEGOCIO.Services;
public class RecibosTemplates
{
	public static string ContractStyle = @"<style>
				.table td {
					border: 1px black solid;
					padding: 5px;
					width: 7.14% !important;
				}

				td.col2 {
					width: 14.28% !important;
				}

				td.col6 {
					width: 42.85% !important;
				}

				td.val {
					text-align: right;
				}
				span.sombrear {
					color: #000 !important;
					border: none !important;
					background-color:#FFFF00 !important;
				}
			</style>
	";
	public static string ContractHeader = @"
		<p style='font-size:9.5px; margin-top:0px; margin-bottom:0px; text-align:center; padding-bottom:0px'>
					<img class='img-container' style='margin:auto' src='{{ logo }}' width='100'>
					<br/>
					{{ titulo }}
					<br/>
					Carazo - Nicaragua
					 <br/>
					{{ subtitulo }}
					  <br/>
					 RUC J0310000300895
		</p>
					  
	   
		<p style='font-size:9.5px; margin-top:0px; margin-bottom:0px; font-weight: bold; text-align:center; padding-bottom:0px'>Oficina Central
					{{ info_tel }}</p>
		<p style='font-size:9.5px; margin-top:0px; margin-bottom:0px; text-align:center; padding-bottom:0px'>TABLA DE PAGO POR REESTRUCTURACIÓN 
			CONTRATO <br/> Nº {{ numero_contrato }} 
		</p>
	";
	public static string Footer = @"<table style='margin-top: 0px; margin-bottom: 0px;  width: 100%'>
	 <tbody>
		<tr style='margin-top: 0px; margin-bottom: 0px;  width: 100%'> 
			<td style='font-size: 9.5px; text-align: left;   width: 33% !important; border: none !important;'>
				<p style='text-align: center !important; font-size:10px;width: 200px !important; margin-top:100px; border-top: solid 1px #000 !important; padding-bottom:0px; margin-bottom:0px; ; padding-top:10px'>
					Deudor: {{ primer_nombre }} {{ segundo_nombre }} {{ primer_apellido }} {{ segundo_apellidio }}
				</p>
				<p style='text-align: center !important; font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px;'>Cédula:
					{{ identificacion }}
				</p>
				<p style='text-align: center !important; font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px;'>Cel:{{ telefono }}
				</p>
			</td>     
			<td style='font-size: 9.5px; text-align: center !important;   width: 33% !important; border: none !important'>
				<p style='text-align: center !important; font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px;'>
					<img style='height:80px; width:140px;' src='{{ firma_vicepresidente }}'/>
				</p>
				<p style='text-align: center !important; font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px; border-top: none !important; width: 100% !important; padding-top:10px'>
					{{ datos_apoderado_vicepresidente }}<br/>
					Vicepresidente de junta directiva<br/>	
					{{ cedula_apoderado_vicepresidente }}
				</p>
			</td>    
			<td style='font-size: 9.5px; text-align: right !important;   width: 33% !important; border: none !important'>
				<p style='text-align: center !important;  font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px;'>
					<img style='height:80px; width:140px;' src='{{ firma }}'/>
				</p>
				<p style='text-align: center !important; font-size:10px; margin-top:0px; padding-bottom:0px; margin-bottom:0px; border-top: none !important; width: 100% !important; padding-top:10px'>
					{{ datos_apoderado }}<br/>
					Presidente de junta directiva<br/>
					{{ cedula_apoderado }}
				</p>
			</td>   
		</tr> 
		</tbody>
		</table>  
	";
	public static string ReestructureTable = @"
	<!DOCTYPE html>
		<html>
		<head>" + ContractStyle + @"</head>
		<body>" + ContractHeader + @"<style>
				td {
					border: 1px black solid;
					padding: 5px;
					width: 7.14% !important;
				}

				td.col2 {
					width: 14.28% !important;
				}

				td.col6 {
					width: 42.85% !important;
				}

				td.val {
					text-align: right;
				}
				span.sombrear {
					 border: 1px black solid;
					color:#FFFF00;
					background-color:#FFFF00;
				}
			</style>
			<br/>
			<div style='font-size: 10px;'>
				{{ tabla_articulos }}
			</div>			
			<br/><br/>
			<table class='table' style='width: 100%;font-size:9px !important; border-collapse: collapse;'>
				<thead>
					<tr>
						<td colspan='2' class='col2'><span lang='ES-NI'>CAPITAL REESTRUCTURADO C$</span></td>
						<td colspan='2' class='col2'> <span lang='ES-NI'>C$ {{ Valoracion_empeño_cordobas }}</span></td>
						<td colspan='6' class='col6' rowspan='2'>
						<span lang='ES-NI'>TABLA DE AMORTIZACION DE DEUDA POR GARANTIA PRENDARIA</span>
						</td>
						<td colspan='2' class='col2'><span lang='ES-NI'>CUOTA C$</span></td>
						<td colspan='2' class='col2'> <span lang='ES-NI'>C$ {{ cuotafija }}</span></td>
					</tr>
					<tr>
						<td colspan='2' class='col2'> CAPITAL REESTRUCTURADO $</td>
						<td colspan='2' class='col2'> $ {{ Valoracion_empeño_dolares }}</td>
						<td colspan='2' class='col2'><span lang='ES-NI'>CUOTA FIJA<br>$</br></span> </td>
						<td colspan='2' class='col2'>$ {{ cuotafija_dolares }}</td>
					</tr>
					<tr>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'>PLAZO PARA CANCELAR: {{ plazo }} mes(es)</span>
						</td>
						<td colspan='2' class='col2'>
						<p style='margin-bottom:0cm;text-align:center;line-height:normal'>
							<span lang='ES-NI'>INTERÉS NETO CORRIENTE(a): {{ interes_inicial }}%</span>
						</p>
						</td>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'>Demás cargos a
							pagar en relación con lo pactado(b): {{ sum_intereses }}%</span>
						</td>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'> (a) + (b)</span>
						</td>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'>ABONO AL	CAPITAL</span>
						</td>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'>TOTAL A PAGAR</span>
						</td>
						<td colspan='2' class='col2'>
						<span lang='ES-NI'>MONTO
							RESTANTE</span>
						</td>
					</tr>
					<tr>
						<td colspan='2' class='col2'><span lang='ES-NI'>FECHAS DE PAGO</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
						<td><span lang='ES-NI'>C$</span></td>
						<td><span lang='ES-NI'>$</span></td>
					</tr>
				</thead>
				{{ tbody_amortizacion }}
			</table>
			<p>
			<u>Modificación a cláusula 4  y 6 del contrato:</u> La presente “Tabla de pago por reestructuración de contrato” 
			sustituye las fechas de pago que se indican en la cláusula 4 del contrato; así como el monto de pago en 
			caso que el capital reestructurado sea menor que el capital prestado. La cláusula 6 del contrato que hace 
			referencia a la mora, queda sujeta a cambios, en caso que la cuota por pagar en la reestructuración no sea 
			la misma del contrato.
			
			 <br/>
			 
			<u>Obligación del Deudor:</u> En caso de no entregar esta tabla de pago por reestructuración al momento de cancelar
			 su deuda, el deudor deberá pagar el monto de $1.00 un dólar o su equivalente en córdobas por pérdida de documento.
			
			</p>
			<p style='text-align: center'>
			Este contrato se ha reestructurado {{ fecha_restructuracion }}
			</p>
			" + Footer + @"
			</body>
			</html>
	";
	//TODO AGREGAR ESTO EN RECIBO ACREEDOR <p class='w-50'><strong>Clasificacion:</strong> {{ clasificacion }}</p>    
	
	public static string recibo = @"
		<!DOCTYPE html>
		<html>
		<head>
			<title>Recibo</title>
			<style>
				body{
					font-size: 10px;            
					width: 298.5px;             
				}
				.w-100{
					width: 100%;
				}
				.w-50{
					display: flex;
					justify-content: space-between;
				}
				.w-50 p {
					width: 48%; 
					box-sizing: border-box; 
				}        
				.text-center,.content-center{
					text-align: center;
				}
				.f-10{
					font-size: 10px;
				}
				p{
					margin-bottom: 0px; 
					margin-top: 5px;   
				}
				.img-container{
					display: flex;
					justify-content: center;
					margin-bottom: 20px; 
				}
			</style>
		</head>
		<body>
			<img class='img-container' style='margin:auto' src='{{ logo }}' width='100'>
			<br/>
			<p class='text-center'>EMPEÑOS Y PRESTAMOS SOCIEDAD ANONIMA.</p>
			<div class='content-center f-10'>
				<p>RUC J0310000300895</p>
				<p>ASFC 06/0003/10/2020/1</p>
				<p>{{ info_tel }}</p>
			</div>
			<p class='content-center'>RECIBO OFICIAL DE CAJA</p>

			<div class='w-50'  style='margin-top: 30px;'>
				<p class='w-50'><strong>Contrato #:</strong> {{ numero_contrato }}</p>		
				<p class='w-50'><strong>Recibo Num:</strong> {{ recibo_num }}</p>	
			</div>	
			<p class='w-100'><strong>Fecha:</strong> {{ fecha }}</p>
			<div class='w-50' >
				<p class='w-50'><strong>Sucursal:</strong> {{ sucursal }}</p>
				<p class='w-50'><strong>Cambio de C$ A $:</strong> {{ cambio }}</p>
			</div>
			<div class='w-50' >
				<p class='w-50'><strong>Cajero:</strong> {{ cajero }}</p>
				<p class='w-50'><strong>Tipo:</strong> {{ tipo }}</p>
			</div>

			<p style='margin-top: 20px;'><strong>Generales del Contrato</strong></p>
			<p><strong>Cliente:</strong> {{ cliente }}</p>

			<div class='w-50' >
				
				<p class='w-50'><strong>Categoria:</strong> {{ categoria }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Cuotas Pactadas:</strong> {{ cuotas }}</p>    
				<p class='w-50 '><strong>Cuotas Pendientes:</strong> {{ cuotas_pendientes }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Saldo Anterior:</strong> C$ {{ saldo_anterior_cordobas }}</p>
				<p class='w-50 '><strong>Saldo Anterior:</strong> $ {{ saldo_anterior }}</p>  
			</div>


			<div>
				<p style='margin-top: 20px;'><strong>Detalles de su Pago</strong></p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Total Pagado:</strong>C$ {{ total_pagado }}</p>    
				<p class='w-50 '><strong>Total Pagado:</strong>$ {{ total_pagado_dolares }}</p>
			</div>
			
			<div class='w-50 ' >
				<p class='w-50 '><strong>Reestructuracion:</strong> C$ {{ reestructuracion }}</p>    
				<p class='w-50 '><strong>Reestructuracion:</strong> $ {{ reestructuracion_dolares }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Perdida Doc.:</strong> C$ {{ perdida_doc }}</p>
				<p class='w-50 '><strong>Perdida Doc.:</strong> $ {{ perdida_doc_dolares }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Mora:</strong> C$ {{ mora }}</p>
				<p class='w-50 '><strong>Mora:</strong> $ {{ mora_dolares }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>IDCP:</strong> C$ {{ idcp }}</p>
				<p class='w-50 '><strong>IDCP:</strong> $ {{ idcp_dolares }}</p>
			</div>

			<div class='w-50 ' >
				<p class='w-50 '><strong>Abono a Capital:</strong> C$ {{ abono_capital }}</p>
				<p class='w-50 '><strong>Abono a Capital:</strong> $ {{ abono_capital_dolares }}</p>
			</div>
			
			<div class='w-50 ' >
				<p class='w-50 '><strong>Saldo Actual:</strong> C$ {{ saldo_actual_cordobas }}</p>
				<p class='w-50 '><strong>Saldo Actual:</strong> $ {{ saldo_actual_dolares }}</p>
			</div>        
			
			<p><strong>Próximo Pago:</strong>  {{ proximo_pago }}</p>


			<p class='text-center' style='margin-top: 50px;'>Recibí Conforme</p>
			<br><br>
			<P class='text-center'>HAGA SUS PAGOS PUNTUALES Y EVITESE ACCIONES ADMINISTRATIVAS Y PREJUDICIAL</P>
		</body>
		</html>

	";


}