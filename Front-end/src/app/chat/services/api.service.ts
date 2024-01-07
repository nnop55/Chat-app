import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5000/'

  constructor(private http: HttpClient) { }

  getUserId(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}get-user-id`)
  }

  getAllUsers(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}get-all-users/${id}`)
  }

  getChatData(params: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}chat-data`, params)
  }

  // getMessagesById(id: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}?_id=${id}`)
  // }
}
