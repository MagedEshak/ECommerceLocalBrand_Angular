import { Component } from '@angular/core';
import { from } from 'rxjs';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-home',
  imports: [Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
