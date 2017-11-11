using System;
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
            var socket = IO.Socket("http://ec2-54-201-123-21.us-west-2.compute.amazonaws.com:8080");

            socket.On(Socket.EVENT_CONNECT, () =>
            {
                Console.WriteLine("Connected to the socket");
                var text = new { text = "Hello World Server" };
                string json = JsonConvert.SerializeObject(text);
                socket.Emit("helloServer", json);
            });

            socket.On("helloClient", (data) =>
            {
                var text = new { text = "" };
                var t = JsonConvert.DeserializeAnonymousType((string)data, text);
                Console.WriteLine(t.text);
            });

            Console.ReadLine();
        }
    }
}
