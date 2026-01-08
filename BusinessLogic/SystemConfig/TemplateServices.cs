using System.Reflection;
using System.Text;
using APPCORE;
using APPCORE.Security;
using DataBaseModel;

namespace CAPA_NEGOCIO.SystemConfig
{
    public class TemplateServices
    {


        public static string RenderTemplate(string templateContent, object model)
        {
            PropertyInfo[] properties = model.GetType().GetProperties();
            string renderedTemplate = templateContent;
            foreach (PropertyInfo property in properties)
            {
                string propertyName = property.Name;
                object propertyValue = property.GetValue(model, null);

                string placeholder = $"{{{{ {propertyName} }}}}";

                if (propertyValue != null)
                {
                    renderedTemplate = renderedTemplate.Replace(placeholder, propertyValue.ToString());
                }
                else
                {
                    renderedTemplate = renderedTemplate.Replace(placeholder, "");
                }
            }
            LoggerServices.AddMessageInfo("FIN DE RENDER PROPS");
            return renderedTemplate;
        }

       
    }
}