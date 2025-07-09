import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsService } from '../../shared/services/Product/product-details.service';
import { IProduct } from '../../models/iproduct';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment.development';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css'],
})
export class ProductDetails implements OnInit {
  product: IProduct | null = null;
  isLoading = true;
  selectedSize: string | null = null;
  quantity: number = 1;
  currentSlide = 0;

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService,
    private cartItemService: CartItemService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productDetailsService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
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

  get imageUrl(): string {
    const imagePath =
      this.product?.productImagesPaths?.[0]?.imagePath ||
      'assets/images/images.jpeg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads'))
      return `${environment.baseServerUrl}${imagePath}`;
    if (imagePath.startsWith('/assets')) return imagePath;
    return `/assets/images/${imagePath}`;
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
        if (img.imagePath.startsWith('http')) return img.imagePath;
        if (img.imagePath.startsWith('/uploads'))
          return `${environment.baseServerUrl}${img.imagePath}`;
        if (img.imagePath.startsWith('/assets')) return img.imagePath;
        return `/assets/images/${img.imagePath}`;
      });
  }

  get currentImage(): string {
    return (
      this.sortedImageUrls[this.currentSlide] || '/assets/images/default.png'
    );
  }

  nextSlide() {
    if (this.currentSlide < this.sortedImageUrls.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.sortedImageUrls.length - 1;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  getStockQuantity(size: string): number {
    const sizeObj = this.product?.productSizes?.find((s) => s.size === size);
    return sizeObj ? sizeObj.stockQuantity : 0;
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
    const sizeObj = product.productSizes?.find((s) => s.size === selectedSize);
    if (!sizeObj) {
      Swal.fire({
        icon: 'error',
        title: 'المقاس المختار غير صالح.',
      });
      return;
    }

    const cartItem = {
      cartId: 0,
      productId: product.id,
      productSizeId: sizeObj.id,
      quantity: quantity,
      unitPrice: product.price,
      totalPriceForOneItemType: product.price * quantity,
      name: product.name, // إضافي لعرض المنتج في العربة المحلية
      image: product.productImagesPaths?.[0]?.imagePath || null, // إضافي
    };

    const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const foundItem = existingCart.find(
      (item: any) =>
        item.productId === product.id && item.productSizeId === sizeObj.id
    );

    if (foundItem) {
      foundItem.quantity += quantity;
      this.showAlert('✅ تم زيادة الكمية للمنتج في السلة');
    } else {
      existingCart.push(cartItem);
      this.showAlert('✅ تمت إضافة المنتج للسلة');
    }

    localStorage.setItem('guestCart', JSON.stringify(existingCart));
  }

  syncLocalCartWithServer() {
    this.authService.isLoggedIn().subscribe((isAuthenticated) => {
      if (!isAuthenticated) return;

      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (localCart.length === 0) return;

      for (const item of localCart) {
        this.cartItemService
          .addToCart(
            {
              id: item.productId,
              name: item.name,
              description: '',
              price: item.unitPrice,
              discountPercentage: 0,
              categoryId: 0,
              isDeleted: false,
              productSizes: [
                {
                  id: item.productSizeId,
                  size: '',
                  productId: item.productId,
                  stockQuantity: 0,
                  width: 0,
                  height: 0,
                },
              ],
              productImagesPaths: item.image
                ? [{ id: 0, imagePath: item.image, priority: 0 }]
                : [],
              NewArrival: {} as any,
            },
            '',
            item.quantity
          )
          .subscribe({
            next: () => console.log('تمت مزامنة العنصر:', item.name),
            error: (err) => console.error('فشل مزامنة العنصر:', item.name, err),
          });
      }

      localStorage.removeItem('guestCart');
      this.showAlert('✅ تمت مزامنة السلة مع السيرفر');
    });
  }

  addToCart() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'من فضلك اختر مقاس أولًا.',
        confirmButtonText: 'موافق',
      });
      return;
    }

    this.authService.isLoggedIn().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.cartItemService
          .addToCart(this.product!, this.selectedSize!, this.quantity)
          .subscribe({
            next: () => this.showAlert('✅ تم إضافة المنتج إلى العربة'),
            error: (err) =>
              Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text:
                  err?.error?.message || err?.message || 'فشل إضافة المنتج.',
              }),
          });
      } else {
        this.addToLocalStorageCart(
          this.product!,
          this.selectedSize!,
          this.quantity
        );
      }
    });
  }
}
