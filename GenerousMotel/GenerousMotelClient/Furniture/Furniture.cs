using CitizenFX.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    public interface IFurniture
    {
        string Text { get; set; }
        Vector3 PositionOffset { get; set; }
        float InteractionRange { get; set; }
        bool Restricted { get; set; }
        void Interaction();
    }
}
