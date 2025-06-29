import { Component } from '@angular/core';
import { from } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
