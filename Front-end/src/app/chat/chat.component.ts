import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { WebSocketService } from './services/web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  webSocket = inject(WebSocketService);
  acRoute = inject(ActivatedRoute);
  loadingService = inject(LoadingService);
  shared = inject(SharedService);
  content: "auth" | "list" | "messages" = "auth"
  sendTo: any;
  messagesData: any = new Object()
  isLoading: boolean = true
  userId: any

  constructor() {
    this.userId = sessionStorage.getItem('userId')
  }

  ngOnInit(): void {
    this.loading()
    this.listener()
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.webSocket.emitUserInactive(this.userId)
    this.webSocket.closeConnection();
  }

  loading() {
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading
    })
  }

  listener() {
    this.webSocket.handleSocketObserver('sendMessage').subscribe((data: any) => {
      if (!this.messagesData['messages']) this.messagesData['messages'] = []
      data['fromMe'] = data.userId == this.userId
      console.log(data)
      this.messagesData['messages'].push(data)
      this.shared.setScrollState('clicked')
    });

    let userActive = sessionStorage.getItem("userId")
    if (userActive) {
      this.content = "list"
      this.webSocket.onLoad(userActive);
    }
  }

  handleListAction(event: any) {
    if (event.user) {
      this.sendTo = event.user
      this.content = event.content
      if (event.chatData) {
        this.messagesData = event.chatData
        this.sendTo['chatId'] = event.chatData['chatId']
      }
    } else {
      this.content = event.content
    }

  }

  ngOnDestroy(): void {
    this.webSocket.closeConnection();
  }
}
