import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private scrollSubject = new BehaviorSubject<string>('');
  scroll$ = this.scrollSubject.asObservable();

  constructor() { }

  setScrollState(ev: string = ''): void {
    this.scrollSubject.next(ev);
  }
}
