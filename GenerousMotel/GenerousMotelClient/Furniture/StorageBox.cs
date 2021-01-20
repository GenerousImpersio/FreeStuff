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
    class StorageBox : IFurniture
    {
        public string Text { get; set; }
        public Vector3 PositionOffset { get; set; }
        public bool Restricted { get; set; }
        public float InteractionRange { get; set; }

        public StorageBox(string _text, Vector3 _positionOffset, bool _restricted, float _interactionRange)
        {
            Text = _text;
            PositionOffset = _positionOffset;
            Restricted = _restricted;
            InteractionRange = _interactionRange;
        }

        public void Interaction()
        {
            BaseScript.TriggerEvent("m3:inventoryhud:client:openStash", "Motel", "all");
        }
    }
}
