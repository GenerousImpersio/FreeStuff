using CitizenFX.Core;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

namespace GenerousMotelServer.Managers
{
    public class SQLManager : BaseScript
    {
        private static readonly MySqlConnection connection = new MySqlConnection(Settings.CONNECTION_STRING);
        public static SQLManager Instance { get; private set; }

        public SQLManager()
        {
            Instance = this;
        }

        public void FetchAll(string query, Dictionary<string, object> pars, Action<List<dynamic>> action)
        {
            Exports["mysql-async"].mysql_fetch_all(query, pars, action);
        }

        public void Execute(string query, Dictionary<string, object> pars, Action<int> action)
        {
            Exports["mysql-async"].mysql_execute(query, pars, action);
        }

        public bool IsReady()
        {
            return Exports["mysql-async"].is_ready();
        }

    }
}
