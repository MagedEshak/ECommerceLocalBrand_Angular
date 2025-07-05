import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css'],
})
export class Splash implements OnInit {
  constructor() { }
  ngOnInit(): void {

  }
}
