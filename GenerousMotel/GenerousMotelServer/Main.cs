using CitizenFX.Core;
using CitizenFX.Core.Native;
using GenerousMotelServer.Managers;
using System;
using System.Collections.Generic;

namespace GenerousMotelServer
{
    public class Main : BaseScript
    {
        public Main()
        {
            EventHandlers["onResourceStart"] += new Action<string>(OnResourceStart);
            EventHandlers["generous_motel:RequestAllRoomStates"] +=  new Action<NetworkCallbackDelegate>(OnClientRequestAllRoomStates);
            EventHandlers["generous_motel:RequestRoomState"] +=  new Action<NetworkCallbackDelegate, string>(OnClientRequestRoomState);
            EventHandlers["generous_motel:RequestRoomOwner"] += new Action<NetworkCallbackDelegate, Player, string>(OnClientRequestRoomOwnCount);
            EventHandlers["generous_motel:ClientInteractWithDoor"] += new Action<Player, string, double>(OnClientInteractWithDoor);
            EventHandlers["generous_motel:OnClientRequestCancelRoom"] += new Action<string>(OnClientRequestCancelRoom);
        }

        private void OnClientRequestCancelRoom(string _roomId)
        {
            RoomManager.CancelRoom(_roomId);
            TriggerClientEvent("generous_motel:OnServerRequestCancelRoom", _roomId);
        }

        private void OnClientRequestRoomOwnCount(NetworkCallbackDelegate cb, [FromSource]Player _source, string _roomID)
        {
            bool returnedValue;

            if (RoomManager.Rooms.TryGetValue(_roomID, out Room _room))
                returnedValue = _room.RoomOwner == "steam:" + _source.Identifiers["steam"];
            else
                returnedValue = false;

            cb.Invoke(returnedValue);
        }

        private void OnClientInteractWithDoor([FromSource] Player _source, string _key, double _currentHeading)
        {
            string _steamHex = "steam:" + _source.Identifiers["steam"].ToString();
            if (RoomManager.CheckOwnership(_steamHex, _key))
            {
                if (RoomManager.Rooms.TryGetValue(_key, out Room _room))
                {
                    _room.Locked = !_room.Locked;
                    UpdateClientRoomData(_key);
                }
            }
            else
            {
                if (!RoomManager.UserHasRoom(_source.Identifiers["steam"]))
                {
                    RoomManager.BuyNewRoom(_key, _steamHex, string.Empty, (int)API.GetGameTimer(), (float)_currentHeading);
                    UpdateClientRoomData(_key);
                }
            }


        }

        private async void OnClientRequestAllRoomStates(NetworkCallbackDelegate cb)
        {
            await cb.Invoke(RoomManager.Rooms);
        }

        private async void OnClientRequestRoomState(NetworkCallbackDelegate cb, string _key)
        {
            Room _roomInfo = RoomManager.GetRoomData(_key);
            await cb.Invoke(_key, _roomInfo);
        }

        void UpdateClientRoomData(string _key)
        {
            if (RoomManager.Rooms.TryGetValue(_key, out Room _room))
            {
                TriggerClientEvent("generous_motel:UpdateRoomData", _key, _room.RoomID, _room.RoomOwner, _room.RoomData, _room.LastPaymentDate, _room.LockedHeading, _room.Locked);
            }
        }

        private async void OnResourceStart(string _resourceName)
        {
            if (API.GetCurrentResourceName() != _resourceName) return;

            while (!SQLManager.Instance.IsReady())
                await Delay(100);

            RoomManager.Rooms = RoomManager.GetRoomDatas();

            Debug.WriteLine("Script başarıyla yüklendi! Development: Can Sönmez#5219");
        }
    }
}
