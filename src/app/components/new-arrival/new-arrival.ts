import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NewArrivalsService } from '../../shared/services/new-arrivals/new-arrivals.service';
import { IProduct } from '../../models/iproduct';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.html',
  styleUrls: ['./new-arrival.css'],
  imports: [CurrencyPipe, Pagination, CommonModule]
})
export class NewArrival implements OnInit {
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;
  isLoading: boolean = false;

  @Output() loaded = new EventEmitter<void>();

  constructor(private _NewArrivalsService: NewArrivalsService) { }

  ngOnInit() {
    this.loadNewArrivals();
  }
  loadNewArrivals(pageIndex: number = 1): void {
    this.isLoading = true;
    this._NewArrivalsService.getNewArrivalProducts(pageIndex).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.filteredProducts = response.items;
          this.currentPageIndex = response.pageIndex;
          this.totalPages = response.totalPages;
          this.isLoading = false;
          this.loaded.emit();
          console.log('✅ Event Emitted from NewArrival');
        }, 1000);
      }, error: (err) => {
        console.log("error fetch data", err);
        this.isLoading = false;
      }
    });
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadNewArrivals(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getProductSizesDisplay(product: IProduct): string {
    return product.productSizes && product.productSizes.length
      ? product.productSizes.map(s => s.size.charAt(0)).join(', ')
      : 'N/A';
  }
}