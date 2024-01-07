import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent {

  @Output() logIn: EventEmitter<"list"> = new EventEmitter<"list">()

  api = inject(AuthService)
  loadingService = inject(LoadingService)

  step: number = 1;
  email!: string;
  verify!: string;
  errorMsg: boolean = false;
  errTxt!: string;

  @HostListener('document:keydown', ['$event'])
  onEnterPress(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.btnClick(this.step)
    }

  }

  sendVerification() {
    this.loadingService.setLoadingState(true)
    this.api.authorization(this.email).subscribe((res) => {
      this.loadingService.setLoadingState(false)
      if (res['status'] == "Already") {
        this.errorMsg = true
        return this.errTxt = res['message']
      }
      this.step = 2
      this.errorMsg = false
    })
  }

  checkVerify() {
    this.loadingService.setLoadingState(true)
    this.api.verify({ code: this.verify, email: this.email }).subscribe({
      next: (res) => {
        this.loadingService.setLoadingState(false)
        if (res['status'] == "Already") {
          this.errorMsg = true
          return this.errTxt = res['message']
        }
        this.verify = '';
        this.email = ''
        this.step = 1;
        this.errorMsg = false
        this.logIn.emit("list")

      },
      error: (err) => {
        this.errorMsg = true
        this.errTxt = err['error']['message']
        this.loadingService.setLoadingState(false)
      }
    }
    )
  }

  btnClick(mode: number) {
    if (mode == 1) {
      if (!this.email || this.email == '') {
        this.errorMsg = true;
        return;
      }
      this.sendVerification();

    } else {
      if (!this.verify || this.verify == '') {
        this.errorMsg = true;
        return;
      }
      this.checkVerify();
    }

  }
}
