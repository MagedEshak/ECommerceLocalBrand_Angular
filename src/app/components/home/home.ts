import { Component } from '@angular/core';
import { from } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewArrivalComponent } from '../new-arrival/new-arrival';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NewArrivalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
