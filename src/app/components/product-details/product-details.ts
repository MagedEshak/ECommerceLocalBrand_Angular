import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { Login } from '../login/login';

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
  isLoggedInNow = false;

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService,
    private cartItemService: CartItemService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
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
          this.isLoading = false;
        },
      });
    }

    this.isLoggedInNow = !!this.authService.getToken();
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
      (item: any) =>
        item.productId === product.id && item.productSizeId === sizeObj.id
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
      this.showAlert('✅ Product quantity updated in cart');
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
      this.showAlert('✅ Product added to cart successfully');
      this.cartItemService.getCurrentUserCart().subscribe((cart) => {
        const count = cart?.cartItems?.length || 0;
        this.cartItemService.updateCartCount(count);
      });
    }

    localStorage.setItem('guestCart', JSON.stringify(existingCart));
    this.cartItemService.updateCartCount(existingCart.length);
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

    if (this.isLoggedInNow) {
      this.cartItemService
        .addToCart(this.product!, this.selectedSize!, this.quantity)
        .subscribe({
          next: () => {
            this.showAlert('✅ Product added to cart');
            this.cartItemService.getCurrentUserCart().subscribe((cart) => {
              const count = cart?.cartItems?.length || 0;
              this.cartItemService.updateCartCount(count);
            });
          },
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
  }

  onSizeChange(): void {
    this.quantity = 1;
  }
  decodeUserFromToken(token: string): { id: string; email: string } {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
      email:
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
    };
  }
  buyNow() {
    const token = this.authService.getToken();
    const isLoggedIn = !!token;

    // التحقق من وجود منتج ومقاس
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

    if (!isLoggedIn) {
      const dialogRef = this.dialog.open(Login, {
        panelClass: 'no-padding-dialog',
        backdropClass: 'custom-backdrop',
        width: '60%',
        maxWidth: 'none',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result?.token) {
          this.authService.setLogin(result.token);
          this.isLoggedInNow = true;
          setTimeout(() => this.cdr.detectChanges(), 0);

          // بعد تسجيل الدخول نروح على صفحة الأوردر
          this.router.navigate(['/order']);
        } else {
          alert('❌ You must log in before placing an order.');
        }
      });

      return;
    }

    // لو مسجل بالفعل، نروح على صفحة الأوردر
    this.router.navigate(['/order']);
  }
}
