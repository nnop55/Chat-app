import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { SendMessageComponent } from './chat/components/send-message/send-message.component';
import { FormsModule } from '@angular/forms';
import { AuthorizationComponent } from './chat/components/authorization/authorization.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { VerificationInterceptor } from './interceptor/verification.interceptor';
import { LogOutInterceptor } from './interceptor/log-out.interceptor';
import { ListComponent } from './chat/components/list/list.component';
import { LoadingComponent } from './chat/components/loading/loading.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    SendMessageComponent,
    AuthorizationComponent,
    ListComponent,
    LoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    PickerComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: VerificationInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LogOutInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
