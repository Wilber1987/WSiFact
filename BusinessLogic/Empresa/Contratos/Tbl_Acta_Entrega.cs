using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using CAPA_NEGOCIO.Util;
using Business;
using DataBaseModel;

namespace BusinessLogic.Empresa.Contratos
{
    public class Tbl_Acta_Entrega : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Acta_Entrega { get; set; }
        public DateTime? Fecha { get; set; }
        public string? Observaciones { get; set; }
        public int? Numero_Contrato { get; set; }
        public int? Numero_Prenda { get; set; }
        public int? Id_Lote { get; set; }
        public int? Id_Sucursal { get; set; }
        public EstadoEnum? Estado { get; set; }
        public ActaTypeEnum? ActaType { get; set; }

        [ManyToOne(TableName = "Detail_Prendas", KeyColumn = "numero_Prenda", ForeignKeyColumn = "Numero_Prenda")]
        public Detail_Prendas? Detail_Prenda { get; set; }


        public bool IsAnulable
        {
            get
            {
                return Estado != EstadoEnum.ANULADO
                && (ActaType == ActaTypeEnum.CONTRATO_QUINCENAL || ActaType == ActaTypeEnum.CONTRATO_MENSUAL)
                && !DateUtil.IsAffterNDays(Fecha, 1);
            }
        }

        // Relaciones de navegación opcionales
        public Transaction_Contratos? Contrato { get; set; }

        [ManyToOne(TableName = "Catalogo_Sucursales", KeyColumn = "Id_Sucursal", ForeignKeyColumn = "Id_Sucursal")]
        public Catalogo_Sucursales? Catalogo_Sucursales { get; set; }


        internal static void ActasDePrendasPorCancelacionContrato(Security_Users? dbUser,
            Transaction_Contratos contrato)
        {
            contrato.Detail_Prendas?.ForEach(prenda =>
            {
                prenda.en_manos_de = EnManosDe.CLIENTE;
                new Tbl_Acta_Entrega
                {
                    Numero_Contrato = contrato.numero_contrato,
                    Fecha = DateTime.Now,
                    Estado = EstadoEnum.ACTIVO,
                    Numero_Prenda = prenda.numero_prenda,
                    Id_Sucursal = dbUser?.Id_Sucursal,
                    ActaType = TypeAdapter(contrato.tipo),
                    Observaciones = @$"prenda ""{prenda.Descripcion} con serie {prenda.serie}""  entregada a cliente por cancelación de contrato #{contrato.numero_contrato}"
                }.Save();
            });
        }

        private static ActaTypeEnum? TypeAdapter(Contratos_Type? tipo)
        {
            if (tipo == null)
            {
                tipo = Contratos_Type.EMPENO;
            }
            switch (tipo)
            {
                case Contratos_Type.EMPENO: return ActaTypeEnum.EMPENO;
                case Contratos_Type.EMPENO_VEHICULO: return ActaTypeEnum.EMPENO_VEHICULO;
                case Contratos_Type.APARTADO_QUINCENAL: return ActaTypeEnum.CONTRATO_QUINCENAL;
                case Contratos_Type.APARTADO_MENSUAL: return ActaTypeEnum.CONTRATO_MENSUAL;
                default: return ActaTypeEnum.EMPENO;
            }
        }

        public ResponseService AnularActa(string Identify, Transaction_Contratos actaContrato)
        {
            try
            {
                var user = AuthNetCore.User(Identify);
                var dbUser = new Business.Security_Users { Id_User = user.UserId }.Find<Security_Users>();

                /* var actaContrato = new Transaction_Contratos
                {
                     numero_contrato = Numero_Contrato
                }.Find<Transaction_Contratos>();*/

                Transactional_Configuraciones beneficioVentaE = new Transactional_Configuraciones()
                           .GetConfig(ConfiguracionesBeneficiosEnum.BENEFICIO_VENTA_ARTICULO_EMPENO.ToString());
                var prenda = actaContrato?.Detail_Prendas?.Find(p => p.numero_prenda == Numero_Prenda);
                Tbl_Lotes.GenerarLoteAPartirDePrenda(prenda, beneficioVentaE, dbUser, actaContrato, false);
                Estado = EstadoEnum.ANULADO;
                Update();
                return new ResponseService()
                {
                    status = 200,
                    message = "Acta anulada correctamente",
                };
            }
            catch (Exception ex)
            {
                return new ResponseService()
                {
                    message = "Error:" + ex.ToString(),
                    status = 500
                };
            }
        }

        public Tbl_Acta_Entrega? FindTbl_Acta_Entrega(string? Identify)
        {
            var User = AuthNetCore.User(Identify);
            var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
            if (User.isAdmin)
            {
                return Find<Tbl_Acta_Entrega>();
            }
            else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
            {
                Id_Sucursal = dbUser?.Id_Sucursal;
                return Find<Tbl_Acta_Entrega>();
            }
            else
            {
                return Find<Tbl_Acta_Entrega>(
                    FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal));
            }
        }

        public List<Tbl_Acta_Entrega>? GetTbl_Acta_Entrega(string? Identify)
        {
            var User = AuthNetCore.User(Identify);
            var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
            if (User.isAdmin)
            {
                return Get<Tbl_Acta_Entrega>();
            }
            else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
            {
                Id_Sucursal = dbUser?.Id_Sucursal;
                return Where<Tbl_Acta_Entrega>();
            }
            else
            {
                return Where<Tbl_Acta_Entrega>(
                    FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal)
                );
            }
        }
    }
    public enum ActaTypeEnum
    {
        CONTRATO_QUINCENAL, CONTRATO_MENSUAL, EMPENO, PRESTAMO,
        EMPENO_VEHICULO
    }

}