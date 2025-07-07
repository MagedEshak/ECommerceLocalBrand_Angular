import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../shared/services/Product/product.service';
import { IProduct } from '../../models/iproduct';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { ProductDetailsService } from '../../shared/services/Product/product-details.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  product: IProduct | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productDetailsService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
          console.log('✅ Images array:', res.productImagesPaths); // <-- دي اللي ضفناها
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching product details', err);
          this.isLoading = false;
        },
      });
    }
  }

  getSizes(): string[] {
    return this.product?.productSizes?.map((s) => s.size) || [];
  }

  get imageUrl(): string {
    const baseUrl = 'https://localhost:7140'; // عدل على حسب سيرفرك الحقيقي
    const imagePath = this.product?.productImagesPaths?.[0]?.imagePath;
    return imagePath
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/uploads/default.png`;
  }
}
