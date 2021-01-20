using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelServer.Managers
{
    public class RoomManager
    {
        public static Dictionary<string, Room> Rooms = new Dictionary<string, Room>();

        public static bool CheckOwnership(string _checkHex, string _doorKey)
        {
            if (Rooms.TryGetValue(_doorKey, out Room _room))
            {
                if (_room.RoomOwner == _checkHex)
                    return true;
                else
                    return false;
            }
            else
            {
                return false;
            }
        }

        public static bool DoesRoomHasOwner(string _doorKey)
        {
            if (Rooms.ContainsKey(_doorKey))
                return true;
            else
                return false;
        }

        public static bool UserHasRoom(string _hex)
        {
            List<Room> _roomsOwned = new List<Room>();
            foreach (KeyValuePair<string, Room> _roomData in Rooms)
            {
                if (_roomData.Value.RoomOwner == "steam:" + _hex)
                    _roomsOwned.Add(_roomData.Value);
            }

            return _roomsOwned.Count > 0;
        }

        public static Room GetRoomData(string _roomID)
        {
            try
            {
                Room _returned = null;
                SQLManager.Instance?.FetchAll($"SELECT * FROM `generous_motel` WHERE `room_id` = {_roomID}", new Dictionary<string, object>(), new Action<List<dynamic>>((data) =>
                {
                    foreach (var obj in data)
                    {
                        _returned = new Room((string)obj.room_id, (string)obj.room_owner, (string)obj.room_data, (int)obj.room_last_payment, (float)obj.room_lockedHeading);
                    }
                }));
                return _returned;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GenerousMotel >> Oda verilerini alma sırasında hata oluştu: {ex}");
            }

            return null;
        }

        public static Dictionary<string, Room> GetRoomDatas()
        {
            Dictionary<string, Room> keyValuePairs = new Dictionary<string, Room>();
            try
            {

                SQLManager.Instance?.FetchAll("SELECT * FROM `generous_motel`", new Dictionary<string, object>(), new Action<List<dynamic>>((data) =>
                {
                    foreach (var obj in data)
                    {
                        Room _room = new Room((string)obj.room_id, (string)obj.room_owner, (string)obj.room_data, (int)obj.room_last_payment, (float)obj.room_lockedHeading);
                        keyValuePairs.Add((string)obj.room_id, _room);
                    }
                }));

                return keyValuePairs;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GenerousMotel >> Oda verilerini alma sırasında hata oluştu: {ex}");
            }

            return null;

        }

        public static void BuyNewRoom(string _roomID, string _roomOwner, string _roomData, int _roomLastPayment, float _lockedHeading)
        {
            Room _newRoom = new Room(_roomID, _roomOwner, _roomData, _roomLastPayment, _lockedHeading)
            {
                Locked = true
            };
            Rooms.Add(_roomID, _newRoom);
            try
            {
                SQLManager.Instance?.Execute("INSERT INTO `generous_motel` (`room_id`, `room_owner`, `room_data`, `room_lockedHeading`, `room_last_payment`) VALUES (@room_id, @room_owner, @room_data, @room_lockedHeading, @room_last_payment);", new Dictionary<string, object>()
                {
                    ["@room_id"] = _roomID,
                    ["@room_owner"] = _roomOwner,
                    ["@room_data"] = _roomData,
                    ["@room_lockedHeading"] = _lockedHeading,
                    ["@room_last_payment"] = _roomLastPayment,
                }, new Action<int>(_ => { }));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GenerousMotel >> Oda satın alma sırasında hata oluştu: {ex}");
            }
        }

        public static void CancelRoom(string _roomID)
        {
            try
            {
                SQLManager.Instance?.Execute("DELETE FROM `generous_motel` WHERE `room_id` = @room_id", new Dictionary<string, object>()
                {
                    ["@room_id"] = _roomID
                }, new Action<int>(_ => { }));
                Rooms.Remove(_roomID);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GenerousMotel >> Oda iptal etme sırasında hata oluştu: {ex}");
            }
        }
    }
}
