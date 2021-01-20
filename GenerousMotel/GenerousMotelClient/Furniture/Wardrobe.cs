using CitizenFX.Core;
using CitizenFX.Core.Native;
using GenerousMotelClient.ESXManager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    class Wardrobe : IFurniture
    {
        public string Text { get; set; }
        public Vector3 PositionOffset { get; set; }
        public bool Restricted { get; set; }
        public float InteractionRange { get; set; }

        public Wardrobe(string _text, Vector3 _positionOffset, bool _restricted, float _interactionRange)
        {
            Text = _text;
            PositionOffset = _positionOffset;
            Restricted = _restricted;
            InteractionRange = _interactionRange;
        }

        public void Interaction()
        {
            OpenClotheMenu();
        }

        private void OpenClotheMenu()
        {

            ESX.TriggerServerCallback("esx_property:getPlayerDressing", new Action<dynamic>((dressing) => 
            {
                ESX.UI.Menu.CloseAll();

                List<ESX.UI.MenuElement> menuElements = new List<ESX.UI.MenuElement>();

                for (int i = 0; i < dressing.Count; i++)
                {
                    menuElements.Add(new ESX.UI.MenuElement 
                    {
                        label = dressing[i],
                        value = i
                    });
                }

                ESX.UI.Menu.Open("default", API.GetCurrentResourceName(), "player_dressing", new ESX.UI.MenuData
                {
                    title = "Kıyafetlerin",
                    align = "right",
                    elements = menuElements
                }, new Action<dynamic, dynamic>((data, menu) => { //Submit
                    BaseScript.TriggerEvent("skinchanger:getSkin", new Action<dynamic>((skin) =>
                    {
                        ESX.TriggerServerCallback("esx_property:getPlayerOutfit", new Action<dynamic>((clothes) => 
                        {
                            BaseScript.TriggerEvent("skinchanger:loadClothes", skin, clothes);
                            BaseScript.TriggerEvent("skinchanger:setlastSkin", skin);
                            BaseScript.TriggerServerEvent("skinchanger:getSkin", new Action<dynamic>((_skin) =>
                            {
                                BaseScript.TriggerServerEvent("esx_skin:save", _skin);
                            }));
                        }), data.current.value + 1);
                    }));
                }), new Action<dynamic, dynamic>((data, menu) => { //Cancel
                    menu.close();
                }));
            }));
        }
    }
}
