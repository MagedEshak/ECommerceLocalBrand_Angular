import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewArrival } from '../new-arrival/new-arrival';
import { Splash } from "../splash/splash";

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NewArrival, Splash],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  isLoading = true;

  onChildLoaded(): void {
    console.log('✅ Child loaded');
    this.isLoading = false;
  }
}