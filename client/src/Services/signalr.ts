import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MessageModel } from '../Models/MessageModel';

@Injectable({
  providedIn: 'root'
})
export class SignalR {
  private hubConnection!: signalR.HubConnection;
  private connected = false;

  async connect(userId: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5007/chathub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      this.connected = true;
      // console.log(`SignalR connected as user: ${userId}`);
    } catch (err) {
      console.error('SignalR connection failed:', err);
    }
  }

  async sendMessage(senderId: string, recipientId: string, message: MessageModel) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn('⚠️ Connection not ready, waiting...');
      await this.waitForConnection();
    }

    try {
      await this.hubConnection.invoke('SendMessage', senderId, recipientId, message);
    } catch (err) {
      console.error('Send failed:', err);
    }
  }

  onReceiveMessage(handler: (senderId: string, message: MessageModel) => void) {
    this.hubConnection.on('ReceiveMessage', (senderId: string, message: MessageModel) => {
      handler(senderId, message);
    });
  }

  private async waitForConnection() {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }
  
}
