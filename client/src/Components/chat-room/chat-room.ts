import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { UserDto } from '../../DTOs/UserDto';
import { User } from '../../Services/user/user';
import { Chat } from '../../Services/chat/chat';
import { MessageModel } from '../../Models/MessageModel';
import { SignalR } from '../../Services/signalr';
@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css']
})
export class ChatRoom implements OnInit {

  @Input() recipient: UserDto | null = null;

  currentLoggedIn: UserDto | null = null;
  messages: MessageModel[] = [];
  roomId: string | null = null;
  isLoadingMessages = true;

  messageForm = new FormGroup({
    content: new FormControl('')
  });

  constructor(
    private signalR: SignalR,
    private userService: User,
    private chatService: Chat,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.currentLoggedIn = this.userService.getCurrentLoggedIn();
    this.signalR.connect(this.currentLoggedIn!.id);
    this.signalR.onReceiveMessage((senderId, message) => {
      this.loadChatRoom();
    });
    this.cdr.detectChanges();

  }

  ngOnChanges(changes: SimpleChanges) {
    this.currentLoggedIn = this.userService.getCurrentLoggedIn();
    this.loadChatRoom();
    if (changes['recipient'] && this.recipient && this.currentLoggedIn) {
      this.loadChatRoom();
    }
  }



  async loadChatRoom() {

    try {
      const response: any = await firstValueFrom(
        this.chatService.getChatRoomId(this.currentLoggedIn!.id, this.recipient!.id)
      );
  
      this.roomId =  response.roomId;
      if (this.roomId) {
        this.chatService.getMessages(this.roomId).subscribe({
          next: (data) => {
            this.messages = data;
            this.isLoadingMessages = false;
            this.cdr.detectChanges();
          }
        });
      }
    } catch (error) {
      console.error('Failed to load chat room:', error);
    }
  }

  async sendMessage(recipientId: string) {
    if (!this.currentLoggedIn || !this.recipient) return;

    const senderId = this.currentLoggedIn.id;

    try {
      let response = await firstValueFrom(
        this.chatService.getChatRoomId(senderId, recipientId)
      );

      let roomId = (response as any)?.roomId;

      if (!roomId) {
        roomId = uuidv4();
        await firstValueFrom(
          this.chatService.createChatRoomId(roomId, senderId, recipientId)
        );
      }

      this.roomId = roomId;

      const message: MessageModel = {
        chatRoomId: this.roomId!,
        senderId,
        recipientId,
        content: this.messageForm.value.content!,
      };

      await firstValueFrom(this.chatService.sendMessage(message));
      this.signalR.sendMessage(senderId, recipientId, message);
      this.messageForm.reset();
    } catch (err) {
      console.error('Send message failed:', err);
    }
  }
}
