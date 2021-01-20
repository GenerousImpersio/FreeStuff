using CitizenFX.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    class FMessage
    {
        public string Message { get; private set; }
        public Vector3 Position { get; private set; }

        public FMessage(string _message, Vector3 _position)
        {
            Message = _message;
            Position = _position;
        }
    }
}
