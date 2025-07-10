import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NewArrivalsService } from '../../shared/services/new-arrivals/new-arrivals.service';
import { IProduct } from '../../models/iproduct';
import { Pagination } from '../pagination/pagination';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-new-arrival',
  templateUrl: './new-arrival.html',
  styleUrls: ['./new-arrival.css'],
  imports: [CurrencyPipe, Pagination, CommonModule, RouterLink],
})
export class NewArrival implements OnInit {
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;

  constructor(private _NewArrivalsService: NewArrivalsService) {}

  ngOnInit() {
    this.loadNewArrivals();
  }

  loadNewArrivals(pageIndex: number = 1): void {
    this._NewArrivalsService.getNewArrivalProducts(pageIndex).subscribe({
      next: (response) => {
        this.filteredProducts = response.items;
        this.currentPageIndex = response.pageIndex;
        this.totalPages = response.totalPages;
      },
      error: (err) => {
        console.log('error fetch data', err);
      },
    });
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadNewArrivals(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getImageUrl(product: IProduct, index: number): string {
    const defaultImage = 'assets/images/images.jpeg';
    const images = product.productImagesPaths;

    if (!images || images.length === 0) return defaultImage;

    // لو ماوس واقف عليه، رجع الصورة التانية لو فيه أكتر من صورة
    if (!images[index])
      return `${environment.baseServerUrl}${images[0].imagePath}`;

    return `${environment.baseServerUrl}${images[index].imagePath}`;
  }

  getProductSizesDisplay(product: IProduct): string {
    return product.productSizes && product.productSizes.length
      ? product.productSizes.map((s) => s.size.charAt(0)).join(', ')
      : 'N/A';
  }
}
