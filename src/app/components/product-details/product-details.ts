import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsService } from '../../shared/services/Product/product-details.service';
import { IProduct } from '../../models/iproduct';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  product: IProduct | null = null;
  isLoading = true;
  selectedSize: string | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productDetailsService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
          console.log('✅ Images array:', res.productImagesPaths);
          console.log('✅ Sizes:', res.productSizes);
          this.selectedSize = res.productSizes?.[0]?.size || null;
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

<<<<<<< Updated upstream
  get imageUrl(): string {
    const baseUrl = 'https://localhost:7140'; // عدل على حسب سيرفرك الحقيقي
    const imagePath = this.product?.productImagesPaths?.[0]?.imagePath || 'assets/images/images.jpeg';
    return imagePath
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/uploads/default.png`;
=======
  getStockQuantity(size: string): number {
    const sizeObj = this.product?.productSizes?.find((s) => s.size === size);
    return sizeObj ? sizeObj.stockQuantity : 0;
  }

  get sortedImageUrls(): string[] {
    if (
      !this.product?.productImagesPaths ||
      this.product.productImagesPaths.length === 0
    ) {
      return ['/assets/images/default.png'];
    }
    return this.product.productImagesPaths
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((img) => {
        // If imagePath is already absolute (starts with http), use as is
        if (img.imagePath.startsWith('http')) return img.imagePath;
        // If imagePath starts with /uploads, use the API root
        if (img.imagePath.startsWith('/uploads'))
          return `https://localhost:7140${img.imagePath}`;
        // Otherwise, treat as relative to /assets/images
        return `/assets/images/${img.imagePath}`;
      });
  }

  // Carousel logic
  currentSlide = 0;

  nextSlide() {
    if (this.currentSlide < this.sortedImageUrls.length - 1) {
      this.currentSlide++;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  increaseQuantity(): void {
    const stock = this.getStockQuantity(this.selectedSize || '');
    if (this.quantity < stock) {
      this.quantity++;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'خد بالك',
        html: '<b>فيه بس قطعة واحدة متاحة!</b>',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return expiry > now;
    } catch (e) {
      return false;
    }
  }

  showAlert(msg: string) {
    Swal.fire({
      icon: 'success',
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  addToLocalStorageCart(
    product: IProduct,
    selectedSize: string,
    quantity: number
  ) {
    const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

    const foundItem = existingCart.find(
      (item: any) => item.id === product.id && item.size === selectedSize
    );

    if (foundItem) {
      foundItem.quantity += quantity;
      this.showAlert('✅ تم زيادة الكمية للمنتج في السلة');
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity,
        image: product.productImagesPaths?.[0]?.imagePath || null,
      });
      this.showAlert('✅ تمت إضافة المنتج للسلة');
    }

    localStorage.setItem('guestCart', JSON.stringify(existingCart));
  }

  addToCart() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'اختر المقاس أولًا',
        confirmButtonText: 'تمام',
      });
      return;
    }

    if (this.isTokenValid()) {
      console.log('✅ Logged in. Send to real cart API.');
      // TODO: هتربط هنا API إضافة للسلة لما يجهز
    } else {
      console.log('❌ Not logged in. Saving to localStorage...');
      this.addToLocalStorageCart(
        this.product,
        this.selectedSize,
        this.quantity
      );
    }
>>>>>>> Stashed changes
  }
}
