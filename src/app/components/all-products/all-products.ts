import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../shared/services/Product/product.service';
import { IProduct } from '../../models/iproduct';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { RouterModule } from '@angular/router';
import { RealTimeService } from '../../shared/services/RealTime/real-time-service';

@Component({
  selector: 'app-all-products',
  imports: [CurrencyPipe, Pagination, RouterModule, CommonModule],
  templateUrl: './all-products.html',
  styleUrl: './all-products.css',
})
export class AllProducts implements OnInit  {
  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;

  constructor(
    private _ProductService: ProductService,
    private realTimeService: RealTimeService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.realTimeService.onNewProductsArrived((newProducts) => {
      // بس لو المستخدم في أول صفحة
      if (this.currentPageIndex === 1) {
        const totalPerPage = 12; // أو العدد اللي عندك لكل صفحة
        const updatedProducts = [...newProducts, ...this.filteredProducts];

        // قلل العدد عشان يفضل ثابت
        this.filteredProducts = updatedProducts.slice(0, totalPerPage);
        console.log('🟡 Real-time products:', newProducts);

      }
    });
  }

  /**
   * Loads products from the ProductService with pagination.
   * This method fetches products for the specified page index,
   * defaulting to the first page if no index is provided.
   * It updates the component's state with the fetched products,
   * current page index, and total pages.
   * * @example
   * * loadProducts(1); // Loads the first page of products
   * * @example
   * * loadProducts(); // Loads the first page of products by default
   * @param {number} [pageIndex=1]
   * @memberof AllProducts
   */
  loadProducts(pageIndex: number = 1): void {
    this._ProductService.getAllProductsByPaginate(pageIndex).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.filteredProducts = response.items;
          this.currentPageIndex = response.pageIndex;
          this.totalPages = response.totalPages;
        }, 1000);
      },
      error: (err) => {
        console.log('error fetch data', err);
      },
    });
  }

  /**
   * Changes the current page index and loads products for that page.
   * This method updates the current page index to the specified page,
   * ensures the page is within valid bounds, and then calls
   * `loadProducts` to fetch the products for that page.
   * * @example
   * * changePage(2); // Changes to page 2 and loads products
   *
   * @param {number} page - The page number to change to.
   * * This method checks if the page number is within the valid range
   * * (between 1 and the total number of pages) before proceeding.
   * * @returns {void}
   * * @throws {Error} If the page number is out of bounds.
   * * @description
   * * This method is used to navigate through paginated product listings.
   * * It ensures that the user can only navigate to valid pages,
   * * preventing any attempts to access non-existent pages.
   * * It also scrolls the window to the top for better user experience.
   * * @example
   * * changePage(3); // Navigates to page 3 and loads the products for
   * @memberof AllProducts
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getProductSizesDisplay(product: IProduct): string {
    return product.productSizes && product.productSizes.length
      ? product.productSizes.map((s) => s.size.charAt(0)).join(', ')
      : 'N/A';
  }
  hoveredProductIndex = -1;

  getImageUrl(product: IProduct, index: number): string {
    const baseUrl = 'https://localhost:7140';
    const defaultImage = 'assets/images/images.jpeg';
    const images = product.productImagesPaths;

    if (!images || images.length === 0) return defaultImage;

    // لو ماوس واقف عليه، رجع الصورة التانية لو فيه أكتر من صورة
    if (!images[index]) return `${baseUrl}${images[0].imagePath}`;

    return `${baseUrl}${images[index].imagePath}`;
  }
}
