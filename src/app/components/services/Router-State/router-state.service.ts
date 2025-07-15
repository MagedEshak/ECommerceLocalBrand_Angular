
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouterStateService {
  private currentUrlSubject = new BehaviorSubject<string>('');
  currentUrl$ = this.currentUrlSubject.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrlSubject.next(event.urlAfterRedirects);
      });
  }

  get currentUrl(): string {
    return this.currentUrlSubject.value;
  }

  get isHome(): boolean {
    return this.currentUrl === '/' || this.currentUrl === '/home' || this.currentUrl === '';
  }

  // get isNotFound(): boolean {
  //   return this.currentUrl === '/notFound' || this.currentUrl === '/order';
  // }

  
}
