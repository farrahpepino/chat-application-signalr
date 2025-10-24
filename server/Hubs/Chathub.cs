using Microsoft.AspNetCore.SignalR;

namespace Server.Hubs{
    public class ChatHub : Hub{
        public async Task SendMessage(string sender, string recipient, string message){
            await Clients.Caller.SendAsync("ReceiveMessage", sender, message);
            if (sender != recipient){
                await Clients.Group(recipient).SendAsync("ReceiveMessage", sender, message);
            }
        }

        public override async Task OnConnectedAsync(){
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId)){
                await Groups.AddToGroupAsync(Context.ConnectionId, userId!);
            }

            await base.OnConnectedAsync();
        }
    }
}
