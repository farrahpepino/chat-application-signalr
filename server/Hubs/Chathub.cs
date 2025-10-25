using Microsoft.AspNetCore.SignalR;
using server.Models;

namespace server.Hubs{
    public class ChatHub : Hub{
        public async Task SendMessage(string sender, string recipient, Message message){
            await Clients.Group(sender).SendAsync("ReceiveMessage", sender, message);
            if (sender != recipient){
                await Clients.Group(recipient).SendAsync("ReceiveMessage", sender, message);
            }
        }

        public override async Task OnConnectedAsync(){
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId)){
                await Groups.AddToGroupAsync(Context.ConnectionId, userId!);
                Console.WriteLine($"{userId} joined group {userId}");

            }

            await base.OnConnectedAsync();
        }
    }
}
