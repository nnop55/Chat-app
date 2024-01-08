import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiEndpoint

  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) {
    const initialUserId = sessionStorage.getItem('userId');
    this.userIdSubject.next(initialUserId);
  }

  setUserId(userId: string): void {
    sessionStorage.setItem('userId', userId);
    this.userIdSubject.next(userId);
  }

  authorization(email: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}send-verification`, { email })
  }

  verify(params: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}verify-code`, params)
  }

  logOut(id: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}log-out`, { id })
  }
}
