import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() {
    this.applyInitialTheme();
  }

  applyInitialTheme(): void {

    const isDark =
      localStorage.getItem('theme') === 'dark'
      || (!localStorage.getItem('theme')
        && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }


  setTheme(mode: 'light' | 'dark'): void {
    localStorage.setItem('theme', mode);
    this.applyInitialTheme();
  }

  resetTheme(): void {
    localStorage.removeItem('theme');
    this.applyInitialTheme();
  }
}

