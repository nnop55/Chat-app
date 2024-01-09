import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { FormControl, Validators } from '@angular/forms';
import { StepMode } from '../../unions';

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
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  verifyFormControl = new FormControl('', [Validators.required]);
  errorMsg: boolean = false;
  errTxt!: string;
  stepMode = StepMode

  @HostListener('document:keydown', ['$event'])
  onEnterPress(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.btnClick()
    }

  }

  sendVerification() {
    this.loadingService.setLoadingState(true)
    this.api.authorization(this.emailFormControl?.value).subscribe((res) => {
      this.loadingService.setLoadingState(false)
      if (res['status'] == "Already") {
        this.errorMsg = true
        return this.errTxt = res['message']
      }
      this.step = this.stepMode.verify
      this.errorMsg = false
    })
  }

  checkVerify() {
    this.loadingService.setLoadingState(true)
    this.api.verify({ code: this.verifyFormControl?.value, email: this.emailFormControl?.value }).subscribe({
      next: (res) => {
        this.loadingService.setLoadingState(false)
        if (res['status'] == "Already") {
          this.errorMsg = true
          return this.errTxt = res['message']
        }
        this.step = this.stepMode.email;
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

  btnClick() {
    this.step == this.stepMode.email ?
      (this.sendVerification()) : (this.checkVerify())
  }

  disableBtn() {
    return this.step == this.stepMode.email ?
      (this.emailFormControl.invalid) : (this.verifyFormControl.invalid)
  }
}
