using CitizenFX.Core;
using CitizenFX.Core.Native;
using GenerousMotelClient.ESXManager;
using GenerousMotelClient.Managers;
using System;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    class Main : BaseScript
    {
        bool canInteract = false;
        string interactableDoor = string.Empty;
        int currentInterior = 0;

        public static Motel CurrentMotel { get; set; }
        public static Room CurrentRoom { get; set; }

        public Main()
        {
            EventHandlers["onClientResourceStart"] += new Action<string>(OnClientResourceStart);
            EventHandlers["generous_motel:UpdateRoomData"] += new Action<string, string, string, string, int, float, bool>(RoomManager.OnUpdateRoomData);
            EventHandlers["generous_motel:OnServerRequestCancelRoom"] += new Action<string>(RoomManager.OnServerRequestCancelRoom);
        }

        private async Task Main_DoorTextLoop()
        {
            if (TextManager.fMessage != null)
            {
                Vector3 _positionToDraw = TextManager.fMessage.Position;
                string _messageToDraw = TextManager.fMessage.Message;
                Utils.DrawText3D(_positionToDraw, 0.4f, _messageToDraw);
            }

            await Task.FromResult(0);
        }

        private async Task Main_FurnitureInteraction()
        {
            if (currentInterior != 0 && CurrentMotel != null)
            {
                foreach (IFurniture _furniture in CurrentMotel.Furnitures)
                {
                    Vector3 _offset = _furniture.PositionOffset;
                    Vector3 _calculatedFurnitureOffset = API.GetOffsetFromInteriorInWorldCoords(API.GetInteriorFromEntity(LocalPlayer.Character.Handle), _offset.X, _offset.Y, _offset.Z);
                    if (Vector3.Distance(_calculatedFurnitureOffset, LocalPlayer.Character.Position) <= _furniture.InteractionRange)
                    {
                        Utils.DrawText3D(_calculatedFurnitureOffset, 0.4f, _furniture.Text);
                    }

                }

                if (API.IsControlJustPressed(0, 38))
                {
                    foreach (IFurniture _furniture in CurrentMotel.Furnitures)
                    {
                        Vector3 _offset = _furniture.PositionOffset;
                        Vector3 _calculatedFurnitureOffset = API.GetOffsetFromInteriorInWorldCoords(API.GetInteriorFromEntity(LocalPlayer.Character.Handle), _offset.X, _offset.Y, _offset.Z);
                        if (Vector3.Distance(_calculatedFurnitureOffset, LocalPlayer.Character.Position) <= _furniture.InteractionRange)
                        {
                            if (_furniture.Restricted)
                            {
                                TriggerServerEvent("generous_motel:RequestRoomOwner", new Action<bool>((data) =>
                                {
                                    Debug.WriteLine(data.ToString());
                                    if (data)
                                    {
                                        _furniture.Interaction();
                                    }
                                }), interactableDoor);
                            }
                            else
                            {
                                _furniture.Interaction();
                            }
                        }
                    }
                }
            }
            await Task.FromResult(0);
        }

        private async Task Main_MotelDetection()
        {
            CurrentMotel = Utils.GetCurrentMotel();

            currentInterior = API.GetInteriorFromEntity(LocalPlayer.Character.Handle);

            await Delay(3000);
        }

        private void OnClientResourceStart(string _resourceName)
        {
            if (_resourceName != API.GetCurrentResourceName()) return;

            Tick += Main_DoorInteraction;
            Tick += Main_DoorText;
            Tick += Main_MotelDetection;
            Tick += Main_DoorTextLoop;
            Tick += Main_FurnitureInteraction;
            Tick += Main_CurrentRoomFinder;

            RoomManager.UpdateAllRoomDatas();
        }

        private async Task Main_CurrentRoomFinder()
        {
            if (RoomManager.Rooms.TryGetValue(interactableDoor, out Room _room))
            {
                CurrentRoom = _room;
            }
            await Delay(3000);
        }

        private async Task Main_DoorText()
        {
            if (CurrentMotel != null)
            {
                Vector3 _playerPosition = LocalPlayer.Character.Position;
                int _closestDoorHandle = API.GetClosestObjectOfType(_playerPosition.X, _playerPosition.Y, _playerPosition.Z, 0.7f, CurrentMotel.DoorHash, false, false, false);
                Vector3 _closestDoorPosition = API.GetEntityCoords(_closestDoorHandle, false);

                canInteract = _closestDoorHandle != 0;

                if (canInteract)
                {
                    Vector3 _doorOffset = CurrentMotel.DoorOffset;
                    Vector3 _calculatedDoorOffset = API.GetOffsetFromEntityInWorldCoords(_closestDoorHandle, _doorOffset.X, _doorOffset.Y, _doorOffset.Z);
                    int _roundedX = (int)Math.Round(_closestDoorPosition.X), _roundedY = (int)Math.Round(_closestDoorPosition.Y), _roundedZ = (int)Math.Round(_closestDoorPosition.Z);
                    string _calculatedDoorID = _roundedX.ToString() + _roundedY.ToString() + _roundedZ.ToString();
                    interactableDoor = _calculatedDoorID;
                    string _textDrawn = string.Empty;

                    if (!RoomManager.Rooms.TryGetValue(_calculatedDoorID, out Room _room))
                    {
                        _textDrawn = "~y~Rent Room";
                        API.FreezeEntityPosition(_closestDoorHandle, true);
                    }
                    else if (_room.Locked)
                    {
                        _textDrawn = "~r~Locked";
                        API.FreezeEntityPosition(_closestDoorHandle, true);
                        API.SetEntityHeading(_closestDoorHandle, _room.LockedHeading);
                    }
                    else if (!_room.Locked)
                    {
                        _textDrawn = "~g~Unlocked";
                        API.FreezeEntityPosition(_closestDoorHandle, false);
                    }

                    if (_room != null && ((API.GetEntityHeading(_closestDoorHandle) - _room.LockedHeading) > 5 || (API.GetEntityHeading(_closestDoorHandle) - _room.LockedHeading) < -5))
                    {
                        TextManager.StopTextDrawing();
                    }
                    else
                    {
                        TextManager.StartTextDrawing(new FMessage(_textDrawn, _calculatedDoorOffset));
                    }

                }
                else
                {
                    TextManager.StopTextDrawing();
                }
            }

            await Delay(250);
        }


        private async Task Main_DoorInteraction()
        {
            if (CurrentMotel != null)
            {
                if (canInteract)
                {
                    if (API.IsControlJustPressed(0, 38))
                    {
                        Vector3 _playerPosition = LocalPlayer.Character.Position;
                        int _closestDoorHandle = API.GetClosestObjectOfType(_playerPosition.X, _playerPosition.Y, _playerPosition.Z, 1.5f, unchecked((uint)-1156992775), false, false, false);
                        TriggerServerEvent("generous_motel:ClientInteractWithDoor", interactableDoor, API.GetEntityHeading(_closestDoorHandle));
                    }
                }
            }

            await Task.FromResult(0);
        }
    }
}
