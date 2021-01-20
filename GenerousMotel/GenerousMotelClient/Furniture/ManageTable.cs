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
    class ManageTable : IFurniture
    {
        public string Text { get; set; }
        public Vector3 PositionOffset { get; set; }
        public bool Restricted { get; set; }
        public float InteractionRange { get; set; }

        public ManageTable(string _text, Vector3 _positionOffset, bool _restricted, float _interactionRange)
        {
            Text = _text;
            PositionOffset = _positionOffset;
            Restricted = _restricted;
            InteractionRange = _interactionRange;
        }

        public void Interaction()
        {
            OpenManagementTable();
        }

        private void OpenManagementTable()
        {

            ESX.UI.Menu.CloseAll();

            List<ESX.UI.MenuElement> menuElements = new List<ESX.UI.MenuElement>();

            menuElements.Add(new ESX.UI.MenuElement
            {
                label = "Odayı İptal Et",
                value = "cancelroom"
            });

            ESX.UI.Menu.Open("default", API.GetCurrentResourceName(), "player_dressing", new ESX.UI.MenuData
            {
                title = "Oda Yönetimi",
                align = "right",
                elements = menuElements
            }, new Action<dynamic, dynamic>((data, menu) =>
            { //Submit
                Game.PlayerPed.Position = Main.CurrentMotel.LeavePoint;
                Game.PlayerPed.Heading += 180;
                BaseScript.TriggerServerEvent("generous_motel:OnClientRequestCancelRoom", Main.CurrentRoom.RoomID);
            }), new Action<dynamic, dynamic>((data, menu) =>
            { //Cancel
                menu.close();
            }));
        }
    }
}
