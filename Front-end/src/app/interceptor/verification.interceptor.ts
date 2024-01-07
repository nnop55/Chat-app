import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WebSocketService } from '../chat/services/web-socket.service';
import { ApiService } from '../chat/services/api.service';
import { AuthService } from '../chat/services/auth.service';

@Injectable()
export class VerificationInterceptor implements HttpInterceptor {

  constructor(private webSocket: WebSocketService, private api: ApiService, private auth: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map((event) => {
        if (request.url.endsWith('/verify-code') && event instanceof HttpResponse && event.status === 200) {
          this.api.getUserId().subscribe((data: any) => {
            this.auth.setUserId(data.id)
            this.webSocket.connect()
            this.webSocket.onLoad(data.id);
          });
        }
        return event;
      })
    );
  }
}
