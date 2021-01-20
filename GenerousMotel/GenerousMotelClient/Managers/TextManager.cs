using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenerousMotelClient
{
    class TextManager
    {
        public static FMessage fMessage = null;

        public static void StartTextDrawing(FMessage _messageData)
        {
            fMessage = _messageData;
        }

        public static void StopTextDrawing()
        {
            fMessage = null;
        }

        public static bool GetIsBusy()
        {
            return fMessage != null;
        }
    }
}
