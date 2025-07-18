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
import { Router } from '@angular/router';

// جوه الـ constructor

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
    private authService: AuthService,
    private router: Router // ✅ أضف ده
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
          console.error('Failed to fetch product details', err);
          this.isLoading = false;
        },
      });
    }
  }

  getSizes(): string[] {
    return this.product?.productSizes?.map((s) => s.size) || [];
  }

  get sortedImageUrls(): string[] {
    if (!this.product?.productImagesPaths?.length) {
      return ['/assets/images/default.png'];
    }

    return this.product.productImagesPaths
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map((img) => {
        if (img.imagePath.startsWith('http')) return img.imagePath;
        if (img.imagePath.startsWith('/uploads'))
          return `${environment.baseServerUrl}${img.imagePath}`;
        return `/assets/images/${img.imagePath}`;
      });
  }

  get currentImage(): string {
    return (
      this.sortedImageUrls[this.currentSlide] || '/assets/images/default.png'
    );
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.sortedImageUrls.length;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.sortedImageUrls.length) %
      this.sortedImageUrls.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  getStockQuantity(size: string): number {
    const sizeObj = this.product?.productSizes?.find((s) => s.size === size);
    return sizeObj?.stockQuantity || 0;
  }

  increaseQuantity(): void {
    const stock = this.getStockQuantity(this.selectedSize || '');
    if (this.quantity < stock) {
      this.quantity++;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient quantity available',
        text: 'The requested quantity exceeds the available stock.',
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

  // addToCart() {
  //   if (!this.product || !this.selectedSize) {
  //     this.showWarning('Please select a size first.');
  //     return;
  //   }

  //   this.authService.isLoggedIn().subscribe((isAuthenticated) => {
  //     if (isAuthenticated) {
  //       this.cartItemService
  //         .addToCart(this.product!, this.selectedSize!, this.quantity)
  //         .subscribe({
  //           next: () => this.showSuccess('✅ Product added to your cart.'),
  //           error: (err) =>
  //             this.showError(
  //               err?.error?.message || 'Failed to add product to cart.'
  //             ),
  //         });
  //     } else {
  //       this.addToLocalStorageCart(
  //         this.product!,
  //         this.selectedSize!,
  //         this.quantity
  //       );
  //     }
  //   });
  // }

  addToLocalStorageCart(
    product: IProduct,
    selectedSize: string,
    quantity: number
  ) {
    const sizeObj = product.productSizes?.find((s) => s.size === selectedSize);
    if (!sizeObj) {
      Swal.fire({
        icon: 'error',
        title: 'Selected size is not valid.',
      });
      return;
    }

    const cartItem = {
      productId: product.id,
      productSizeId: sizeObj.id,
      quantity: quantity,
      unitPrice: product.price,
      totalPriceForOneItemType: product.price * quantity,
      name: product.name, // For displaying product in local cart
      image: product.productImagesPaths?.[0]
        ? environment.baseServerUrl + product.productImagesPaths[0].imagePath
        : null,
      productSizeName: selectedSize, // ✅ أضف السطر ده
      productName: product.name,
    };

    const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const foundItem = existingCart.find(
      (item: any) => item.id === product.id && item.size === selectedSize
    );

    if (foundItem) {
      const totalQuantity = foundItem.quantity + quantity;
      if (totalQuantity > sizeObj.stockQuantity) {
        Swal.fire({
          icon: 'warning',
          title: 'Quantity limit exceeded',
          html: `<b>Requested: ${totalQuantity}, Available: ${sizeObj.stockQuantity}</b>`,
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }

      foundItem.quantity = totalQuantity;
      this.showSuccess('✅ Product quantity updated in cart');
    } else {
      if (quantity > sizeObj.stockQuantity) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient quantity available',
          text: 'The requested quantity exceeds the available stock.',
          showConfirmButton: false,
          timer: 2500,
        });

        return;
      }

      existingCart.push(cartItem);
      this.showSuccess('✅ Product added to cart successfully');
    }

    localStorage.setItem('guestCart', JSON.stringify(existingCart));
  }

  addToCart() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select a size first.',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.authService.isLoggedIn().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.cartItemService
          .addToCart(this.product!, this.selectedSize!, this.quantity)
          .subscribe({
            next: () => this.showSuccess('✅ Product added to cart'),
            error: (err) =>
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.message || 'Failed to add product to cart.',
                showConfirmButton: false,
                timer: 2500,
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

  onSizeChange(): void {
    this.quantity = 1;
  }

  buyNow() {
    if (!this.product || !this.selectedSize) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select a size first.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const sizeObj = this.product.productSizes?.find(
      (s) => s.size === this.selectedSize
    );

    if (!sizeObj) {
      Swal.fire({
        icon: 'error',
        title: 'Selected size is not valid.',
      });
      return;
    }

    const buyNowItem = {
      productId: this.product.id,
      productSizeId: sizeObj.id,
      productName: this.product.name,
      productSizeName: sizeObj.size,
      productImageUrl: this.product.productImagesPaths?.[0]
        ? environment.baseServerUrl +
          this.product.productImagesPaths[0].imagePath
        : '/assets/images/default.png',
      quantity: this.quantity,
      unitPrice: this.product.price,
      totalPriceForOneItemType: this.product.price * this.quantity,
    };

    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));

    this.router.navigate(['/order']);
  }

  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }

  showWarning(message: string) {
    Swal.fire({
      icon: 'warning',
      title: message,
      confirmButtonText: 'Ok',
    });
  }
}
