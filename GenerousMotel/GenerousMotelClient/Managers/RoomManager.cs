using CitizenFX.Core;
using CitizenFX.Core.Native;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient.Managers
{
    public class RoomManager
    {
        public static Dictionary<string, Room> Rooms = new Dictionary<string, Room>();

        public static void UpdateAllRoomDatas()
        {
            BaseScript.TriggerServerEvent("generous_motel:RequestAllRoomStates", new Action<dynamic>((data) =>
            {
                IDictionary<string, dynamic> _tempDictionary = (IDictionary<string,dynamic>)data;
                Dictionary<string, Room> roomData = new Dictionary<string, Room>();
                foreach (KeyValuePair<string, dynamic> _tempRoomData in _tempDictionary)
                {
                    string _roomID = _tempRoomData.Value.RoomID;
                    string _roomOwner = _tempRoomData.Value.RoomOwner;
                    string _roomData = _tempRoomData.Value.RoomData;
                    int _roomLastPaymentDate = Convert.ToInt32(_tempRoomData.Value.LastPaymentDate);
                    float _lockedHeading = (float)_tempRoomData.Value.LockedHeading;
                    bool _locked = _tempRoomData.Value.Locked;

                    Room _tempRoom = new Room(_roomID, _roomOwner, _roomData, _roomLastPaymentDate, _lockedHeading)
                    {
                        Locked = _locked
                    };

                    roomData.Add(_tempRoomData.Key, _tempRoom);
                }
                Rooms = roomData;
            }));
        }

        internal static void OnServerRequestCancelRoom(string _roomId)
        {
            Rooms.Remove(_roomId);
        }

        public static void OnUpdateRoomData(string _key, string _RoomID, string _RoomOwner, string _RoomData, int _RoomLastPayment, float _LockedHeading, bool _Locked)
        {
            Debug.WriteLine($"Room data changed. RoomID: {_key}");
            Room _roomToAdd = new Room(_RoomID, _RoomOwner, _RoomData, _RoomLastPayment, _LockedHeading)
            {
                Locked = _Locked
            };

            if (Rooms.ContainsKey(_key))
            {
                Rooms.Remove(_key);
                Rooms.Add(_key, _roomToAdd);
            } else
            {
                Rooms.Add(_key, _roomToAdd);
            }
        }
    }
}
