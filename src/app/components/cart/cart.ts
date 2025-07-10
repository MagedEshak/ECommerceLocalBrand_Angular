import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ لازم تضيفه

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ ضيف RouterModule هنا
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart {
  @Output() close = new EventEmitter<void>();

  closeCartBtn() {
    this.close.emit();
  }
}
