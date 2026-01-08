using System;
using System.Collections.Generic;
using System.Text;
using APPCORE;


namespace CAPA_NEGOCIO.Services
{
    public class FileService
    {
        public static ResponseService upload(string path, string base64String)//exampl(e imagenes,"ascd41asd==")
        {
            try
            {
                DirectoryInfo dir = Directory.CreateDirectory(@"/Files/" + path + "/");//se crea la carpeta, segun documentacion no es necesario validar si ya existe
                string[] subs = base64String.Split(',');
                if (!IsBase64String(subs[1]) || subs.Count() <= 1)
                {
                    return new ResponseService()
                    {
                        status = 403,
                        value = base64String,
                        message = "Formato incorrecto, bse64 invalido"
                    };
                }
                String extension = ".pdf";
                if (subs[0].Contains("data:image/"))
                {
                    extension = ".png";
                }
                Guid myuuid = Guid.NewGuid();//genero el nombre del archivo                
                string myuuidAsString = myuuid.ToString();
                String fileName = myuuid.ToString() + extension;

                byte[] fileByteArray = Convert.FromBase64String(subs[1]);
                File.WriteAllBytes(dir + fileName, fileByteArray);


                Console.WriteLine(dir);

                return new ResponseService()
                {
                    status = 200,
                    value = fileName,
                    message = "Archivo creado correctamente"
                };

            }
            catch (Exception ex)
            {
                return new ResponseService()
                {
                    status = 500,
                    value = ex.ToString(),
                    message = "Error, intentelo nuevamente"
                };
            }

        }

        public static bool IsBase64String(string base64)
        {
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer, out int bytesParsed);
        }
    }
}
