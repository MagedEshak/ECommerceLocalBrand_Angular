import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../shared/services/Product/product.sercivce';
import { IProduct } from '../../models/iproduct';
import { CurrencyPipe } from '@angular/common';
import { Pagination } from "../pagination/pagination";


@Component({
  selector: 'app-all-products',
  imports: [CurrencyPipe, Pagination],
  templateUrl: './all-products.html',
  styleUrl: './all-products.css'
})
export class AllProducts implements OnInit {

  filteredProducts: IProduct[] = [] as IProduct[];
  currentPageIndex = 1;
  totalPages = 1;


  constructor(private _ProductService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(pageIndex: number = 1): void {
    this._ProductService.getAllProductsByPaginate(pageIndex).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.filteredProducts = response.items;
          this.currentPageIndex = response.pageIndex;
          this.totalPages = response.totalPages;
 
        }, 1000);
      }, error: (err) => {
        console.log("error fetch data", err);

      }
    });
  }


  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageIndex = page;
      this.loadProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getProductSizesDisplay(product: IProduct): string {
    return product.productSizes && product.productSizes.length
      ? product.productSizes.map(s => s.size.charAt(0)).join(', ')
      : 'N/A';
  }

}
