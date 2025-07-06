import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewArrival } from '../new-arrival/new-arrival';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NewArrival],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
}