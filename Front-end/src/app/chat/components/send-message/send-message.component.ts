import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent {

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  messageValue: string = '';
  showEmojiPicker: boolean = false
  webSocket = inject(WebSocketService);
  shared = inject(SharedService);

  @Input() sendTo: any;
  @Input() messagesData: any = new Object()
  @Output() emitClick: EventEmitter<any> = new EventEmitter<any>()

  ngOnInit(): void {
    this.scrollToBottom();
    this.shared.scroll$.subscribe((ev: any) => {
      ev == 'clicked' && this.scrollToBottom()
    })
  }

  handleEmojiSelect(event: any): void {
    this.messageValue += event.emoji.native;
  }

  get activeUsers() {
    return this.webSocket.activeUsers
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 10);

  }

  sendMessage() {
    let fromUser = sessionStorage.getItem("userId")
    if (fromUser) {
      this.webSocket.sendMessage(this.sendTo['chatId'], fromUser, this.sendTo['_id'], this.messageValue);
      if (!this.messagesData['messages']) this.messagesData['messages'] = []
      this.messagesData['messages'].push({ userId: fromUser, message: this.messageValue, fromMe: true })
      this.showEmojiPicker = false
      this.scrollToBottom()
    }

    this.messageValue = '';
  }

  back() {
    this.emitClick.emit({ content: 'list' })
  }

}
