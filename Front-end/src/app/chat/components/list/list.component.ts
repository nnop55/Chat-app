import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { delay } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { WebSocketService } from '../../services/web-socket.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  @Output() actionEmitter: EventEmitter<any> = new EventEmitter<any>()

  auth = inject(AuthService)
  api = inject(ApiService)
  loadingService = inject(LoadingService)
  socket = inject(WebSocketService)
  shared = inject(SharedService)

  usersData: any[] = []
  userId!: string

  ngOnInit(): void {
    this.auth.userId$
      .pipe(delay(500))
      .subscribe(userId => {
        if (userId) {
          this.userId = userId
          this.getAllUsers()
        }
      })


  }


  get activeUsers() {
    return this.socket.activeUsers
  }

  getAllUsers() {
    this.loadingService.setLoadingState(true)

    this.api.getAllUsers(this.userId).subscribe((res) => {
      if (res['status'] == "Ok") {
        this.usersData = res['data']
        this.updateUserList()
        setTimeout(() => {
          this.loadingService.setLoadingState(false)
        }, 500)
      }
    })
  }

  updateUserList() {
    this.shared.updateUsers$.subscribe((user) => {
      if (user) {
        let check = this.usersData.find(x => x['_id'] === user['_id'])
        if (!check) this.usersData.push(user)
      }
    })
  }

  openChat(user: any) {
    this.loadingService.setLoadingState(true)
    const postData = {
      firstUser: user['_id'],
      secondUser: this.userId
    }
    this.api.getChatData(postData).subscribe((res) => {
      this.actionEmitter.emit({ user, content: "messages", chatData: res.data })
      this.loadingService.setLoadingState(false)
      this.socket.startConversation(this.userId, user['_id'])
    })
  }

  logOut() {
    let id: any = sessionStorage.getItem('userId')
    this.auth.logOut(this.userId).subscribe((res) => {
      this.actionEmitter.emit({ content: "auth" })
      this.socket.emitUserInactive(id)
      this.socket.closeConnection();
    })
  }
}
