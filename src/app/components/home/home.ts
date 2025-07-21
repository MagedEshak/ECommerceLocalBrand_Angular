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
      desktop: 'assets/images/images.jpeg',
      mobile: 'assets/images/images.jpeg',
    },
    {
      desktop: 'assets/images/Screenshot 2025-06-22 202717.png',
      mobile: 'assets/images/Screenshot 2025-06-22 202717.png',
    },
    {
      desktop: 'assets/images/images.jpeg',
      mobile: 'assets/images/images.jpeg',
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
