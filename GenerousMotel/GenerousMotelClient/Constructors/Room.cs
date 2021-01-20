using CitizenFX.Core;
using GenerousMotelClient.Managers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    public class Room
    {
        public string RoomID { get; private set; }
        public string RoomOwner { get; private set; }
        public string RoomData { get; private set; }
        public int LastPaymentDate { get; private set; }
        public float LockedHeading { get; private set; }
        public bool Locked { get; set; }
        public int DoorHandle { get; set; } = 0;

        public Room(string _RoomID, string _RoomOwner, string _RoomData, int _LastPaymentDate, float _LockedHeading)
        {
            RoomID = _RoomID;
            RoomOwner = _RoomOwner;
            RoomData = _RoomData;
            LastPaymentDate = _LastPaymentDate;
            LockedHeading = _LockedHeading;
            Locked = true;
        }
    }
}
