import { Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NewArrival } from '../new-arrival/new-arrival';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NewArrival],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isMobile = false;
  currentSlide = 0;

  images = [
    {
      desktop: 'assets/images/1.png',
      mobile: 'assets/images/1.png',
    },
    {
      desktop: 'assets/images/2.png',
      mobile: 'assets/images/2.png',
    },
    {
      desktop: 'assets/images/3.png',
      mobile: 'assets/images/3.png',
    },
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;

      setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
