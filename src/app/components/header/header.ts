import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  constructor(public router: Router) {

  }

  get isHome(): boolean {
    return this.router.url === '/' || this.router.url === '/home' ;
  }
}
