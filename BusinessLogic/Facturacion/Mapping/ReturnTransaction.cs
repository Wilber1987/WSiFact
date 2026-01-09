using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using APPCORE.Security;
using BusinessLogic.Empresa.Contratos;
using DataBaseModel;
using UI.CAPA_NEGOCIO.Facturacion.Operations;

namespace BusinessLogic.Facturacion.Mapping
{
    public class ReturnTransaction : TransactionalClass
    {
        public Tbl_Factura? NuevaFactura { get; set; }
        public List<Detalle_Factura>? ArticulosRemplazados { get; set; }
        public double? MinAmount { get; set; }
        public int? Numero_Contrato { get; set; }
        public string? Observaciones { get;  set; }
        public ReturnTypeEnum? ReturnType { get; set; }

        public ResponseService? Execute(string? Identify)
        {
            try
            {
                var User = AuthNetCore.User(Identify);
                var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();

                Tbl_Factura? facturaOriginal = new Tbl_Factura
                {
                    Id_Factura = ArticulosRemplazados
                    .FirstOrDefault()?.Id_Factura
                }.Find<Tbl_Factura>();

                Transaction_Contratos? contratoOriginal = new Transaction_Contratos { numero_contrato = Numero_Contrato }
                    .Find<Transaction_Contratos>();

                List<Tbl_Acta_Entrega> tbl_Acta_Entregas = new Tbl_Acta_Entrega { Numero_Contrato = Numero_Contrato }
                    .Get<Tbl_Acta_Entrega>();
                    
                BeginGlobalTransaction();
                bool isActaEncontrada = false;
                foreach (var tbl_Acta in tbl_Acta_Entregas)
                {
                    var producto = ArticulosRemplazados
                        .Find(articulo => articulo.Lote?.Cat_Producto?.Modelo == tbl_Acta?.Detail_Prenda?.modelo
                            && articulo?.Lote?.Cat_Producto?.Cat_Marca?.Descripcion == tbl_Acta?.Detail_Prenda?.marca);
                            
                    var productoOriginal = facturaOriginal?.Detalle_Factura?
                        .Find(detalle => detalle.Lote?.Cat_Producto?.Modelo == tbl_Acta?.Detail_Prenda?.modelo
                            && detalle?.Lote?.Cat_Producto?.Cat_Marca?.Descripcion == tbl_Acta?.Detail_Prenda?.marca);                            
                    //var descuento = productoOriginal!.Sub_Total > producto!.Sub_Total ? productoOriginal.Sub_Total - producto.Sub_Total : 0;
                    //var pre        
                    if (producto != null)
                    {
                        isActaEncontrada = true;
                        tbl_Acta.Observaciones += $"- Motivo anulación: {Observaciones}";
                        var actaResponse = tbl_Acta.AnularActa(Identify, contratoOriginal);
                        if (actaResponse.status != 200)
                        {
                            RollBackGlobalTransaction();
                            return actaResponse;
                        }
                    }
                }
                if (isActaEncontrada)
                {
                    NuevaFactura!.Observaciones += $"- Factura generada por anulación de acta de entrega para el contrato #{Numero_Contrato} Obseraviones: {Observaciones}";
                    var response = new FacturacionServices()
                        .DoSaveFactura(Identify, NuevaFactura);
                    if (response.status != 200)
                    {
                        RollBackGlobalTransaction();
                        return response;
                    }
                }
                CommitGlobalTransaction();
                return new ResponseService()
                {
                    status = 200,
                    message = "Acta revertida exitosamente"
                };
            }
            catch (Exception ex)
            {
                RollBackGlobalTransaction();
                LoggerServices.AddMessageError("Error al anular el acta", ex);
                return new ResponseService()
                {
                    status = 500,
                    message = "Error al anular el acta",
                    body = ex
                };
            }

        }



    }

    public enum ReturnTypeEnum
    {
        CONTRATO_FINANCIAMIENTO,
        DEVOLUCION
    }
}
