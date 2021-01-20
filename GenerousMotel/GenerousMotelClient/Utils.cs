using CitizenFX.Core;
using CitizenFX.Core.Native;
using GenerousMotelClient.Managers;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    class Utils
    {
        public static void DrawText3D(Vector3 _position, float _scale, string _msg)
        {
            float _screenX = 0, _screenY = 0;
            API.World3dToScreen2d(_position.X, _position.Y, _position.Z, ref _screenX, ref _screenY);
            API.SetTextScale(_scale, _scale);
            API.SetTextFont(4);
            API.SetTextEntry("STRING");
            API.SetTextCentre(true);
            API.SetTextColour(255, 255, 255, 255);
            API.AddTextComponentString(_msg);
            API.DrawText(_screenX, _screenY);
            API.DrawRect(_screenX, _screenY + 0.0150f, 0.065f, 0.03f, 0, 0, 0, 255);
        }

        public static Vector3 RoundVector(Vector3 _vectorToRound)
        {
            return new Vector3((int)_vectorToRound.X, (int)_vectorToRound.Y, (int)_vectorToRound.Z);
        }

        public static Motel GetCurrentMotel()
        {
            foreach (Motel _motel in MotelManager.Motels)
            {
                if (Vector3.Distance(_motel.MotelPosition, Game.PlayerPed.Position) <= _motel.MotelRange)
                {
                    return _motel;
                }
            }

            return null;
        }
    }
}
