using CitizenFX.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    public class Motel
    {
        public string MotelName { get; set; }
        public Vector3 MotelPosition { get; set; }
        public Vector3 DoorOffset { get; set; }
        public Vector3 LeavePoint { get; set; }
        public uint DoorHash { get; set; }
        public float MotelRange { get; set; }
        public List<IFurniture> Furnitures { get; set; }
        
        public Motel()
        {

        }
    }
}
