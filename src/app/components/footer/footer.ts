import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterStateService } from '../../services/router-state.service';
@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  constructor(public routerState: RouterStateService) {
  }
  get isNotFound(): boolean {
    console.log('Footer isNotFound:', this.routerState.isNotFound);
    return this.routerState.isNotFound;
  }
}
