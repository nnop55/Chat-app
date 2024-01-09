import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { SharedService } from './shared.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket!: Socket;
  public activeUsers: any = new Object()

  constructor(private shared: SharedService) {
    this.socket = io(environment.socketUrl, {
      withCredentials: true,
    });
  }

  private setupSocketListeners(): void {

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('updateActiveUsers', (userIds, newUser) => {
      this.activeUsers = userIds
      newUser && this.shared.updateUsersState(newUser)
    });
  }

  public onLoad(id: any) {
    this.setupSocketListeners()
    this.registerUser(id)
  }

  public emitUserInactive(userId: string): void {
    this.socket.emit('userInactive', userId);
  }

  public closeConnection(): void {
    this.socket.close();
    this.socket.disconnect()
  }

  public setToId(id: string): void {
    this.socket.emit('setToId', id);
  }

  public registerUser(userId: string): void {
    this.socket.emit('registerUser', userId);
  }

  public connect() {
    this.socket.connect()
  }

  public sendMessage(chatId: string, senderId: string, receiverId: string, message: string | null): void {
    this.socket.emit('sendMessage', { chatId, senderId, receiverId, message });
  }

  public userTyping(chatId: string | null, receiverId: string, msg: string) {
    this.socket.emit("messageTyping", { chatId, receiverId, msg })
  }

  public handleSocketObserver(event: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }
}
