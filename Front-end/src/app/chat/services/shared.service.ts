import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private scrollSubject = new BehaviorSubject<string>('');
  scroll$ = this.scrollSubject.asObservable();

  private updateUsersSubject = new Subject<any>();
  updateUsers$ = this.updateUsersSubject.asObservable();

  constructor() { }

  setScrollState(ev: string = ''): void {
    this.scrollSubject.next(ev);
  }

  updateUsersState(ev: any): void {
    this.updateUsersSubject.next(ev);
  }

}
