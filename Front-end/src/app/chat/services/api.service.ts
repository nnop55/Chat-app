import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiEndpoint

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
