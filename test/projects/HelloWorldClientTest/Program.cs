﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json;

namespace HelloWorldClientTest
{
    class Program
    {
        static void Main(string[] args)
        {
            var socket = IO.Socket("http://localhost:3000");

            socket.On(Socket.EVENT_CONNECT, () =>
            {
                Console.WriteLine("Connected to the socket");
                //string json = "{\"pcs\":[{\"Name\":\"Chikorita\",\"Ip\":\"192.168.3.45\"}],\"cliente\":{\"Name\":\"Ruben\",\"Ip\":\"192.168.3.58\"},\"pos\":1, \"wall\":0}";
                string json = "{\"pcs\":[],\"cliente\":{\"Name\":\"Chikorita\",\"Ip\":\"192.168.3.45\"},\"pos\":0, \"wall\":1}";
                socket.Emit("selectPosition", json);
            });

            socket.On("helloClient", (data) =>
            {
                var text = new { text = "" };
                var t = JsonConvert.DeserializeAnonymousType((string)data, text);
                Console.WriteLine(t.text);
            });

            socket.On("neighborChange", (data) => {
                Console.WriteLine(data.ToString());
            });

            socket.On("gameInfo", (data) =>
            {
                Console.WriteLine(data.ToString());
            });


            Console.ReadLine();
        }
    }
}
