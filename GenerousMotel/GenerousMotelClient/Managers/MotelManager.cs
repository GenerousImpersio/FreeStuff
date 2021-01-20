using CitizenFX.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient.Managers
{
    public static class MotelManager
    {
        public static List<Motel> Motels = new List<Motel>()
        {
            new Motel
            {
                MotelName = "Pink Cage Motel",
                MotelPosition = new Vector3(326.92f, -210.41f, 53.6f), 
                DoorOffset = new Vector3(0.5f, 0.0f, 0.0f), 
                LeavePoint = new Vector3(324.819f, -229.84f, 54.2171f),
                DoorHash = unchecked((uint)-1156992775), 
                MotelRange = 50f, 
                Furnitures = new List<IFurniture>()
                {
                    new Wardrobe("[E] Wardrobe", new Vector3(-0.3f, 2.6f, -0.4f), false, 2f),
                    new StorageBox("[E] Storage Box", new Vector3(3.75f, 0.5f, -0.4f), false, 2f),
                    new ManageTable("[E] Management", new Vector3(-4.85f, -1.3f, -0.4f), true, 2f)
                } 
            }
        };
    }
}
