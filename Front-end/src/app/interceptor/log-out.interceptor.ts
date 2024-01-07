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

@Injectable()
export class LogOutInterceptor implements HttpInterceptor {
  constructor(private webSocket: WebSocketService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map((event) => {
        if (request.url.endsWith('/log-out') && event instanceof HttpResponse && event.status === 200) {
          let id: any = sessionStorage.getItem('userId')
          this.webSocket.emitUserInactive(id)
          this.webSocket.closeConnection();
          sessionStorage.removeItem('userId')
        }
        return event;
      })
    );
  }
}
