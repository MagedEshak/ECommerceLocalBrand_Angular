  import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ChangeDetectorRef,
    ViewEncapsulation,
  } from '@angular/core';
  import { DecimalPipe, CommonModule } from '@angular/common';
  import { CartItemService } from '../../shared/services/cart/cart.service';
  import { AuthService } from '../../shared/services/Auth/auth.service';
  import { ICartItem } from '../../models/ICartItem';
  import { RouterModule } from '@angular/router';
  import { environment } from '../../../environments/environment.development';
  import Swal from 'sweetalert2';
  import { ProductDetailsService } from '../../shared/services/Product/product-details.service';
  import { MatDialog } from '@angular/material/dialog';
  import { Login } from '../login/login';
  import { FormsModule } from '@angular/forms';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-cart',
    standalone: true,
    templateUrl: './cart.html',
    styleUrls: ['./cart.css'],
    imports: [CommonModule, DecimalPipe, RouterModule, FormsModule], // <-- أضف RouterModule هنا
    encapsulation: ViewEncapsulation.None,
  })
  export class Cart implements OnInit {
    @Output() close = new EventEmitter<void>();

    cartItems: ICartItem[] = [];
    estimatedTotal = 0;
    isLoggedInNow = false;
    cartCount = 0; // <-- نضيف عداد السلة هنا
    constructor(
      private cartService: CartItemService,
      private authService: AuthService, // ⬅️ نستخدمه بدل ما نعتمد على cartService.getToken()
      private dialog: MatDialog,
      private cdr: ChangeDetectorRef,
      private router: Router,
      private productDetailsService: ProductDetailsService // ⬅️ ضفنا السيرفيس هنا
    ) {}

    ngOnInit(): void {
      this.cartService.cartCount$.subscribe((count) => {
        this.cartCount = count; // <-- نحدث عداد السلة هنا
      });
      const token = this.authService.getToken(); // ✅ استخدم AuthService مباشرة

      if (token) {
        this.loadServerCart();
      } else {
        this.loadLocalCart();
      }
    }

    loadServerCart(): void {
      this.cartService.getCurrentUserCart().subscribe({
        next: (res: any) => {
          const items = res?.cartItems ?? [];
          this.cartItems = items.map((item: any) => ({
            id: item.id, // ✅ خد الآي دي هنا
            productId: item.productId,
            productName: item.productName ?? 'Unknown',
            productImageUrl: item.productImageUrl,
            productSizeName: item.productSizeName ?? '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPriceForOneItemType: item.totalPriceForOneItemType,
          }));
          this.calculateTotal();
          // العداد يتم تحديثه تلقائياً في CartItemService
        },
        error: (err) => {
        },
      });
    }
    loadLocalCart(): void {
      const storedCart = localStorage.getItem('guestCart');
      if (storedCart) {
        try {
          const rawItems = JSON.parse(storedCart);
          this.cartItems = rawItems.map((item: any) => {
            return {
              id: 0, // id مش موجود في local cart
              productId: item.productId,
              productSizeId: item.productSizeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPriceForOneItemType: item.totalPriceForOneItemType,
              productName: item.productName || item.name || 'Unknown',
              productImageUrl: item.productImageUrl || item.image || '',
              productSizeName: item.productSizeName || '',
            } as ICartItem;
          });

          this.calculateTotal();
        } catch (e) {
        }
      }
      this.cartService.updateCartCount(this.cartItems.length); // تحديث عداد السلة
    }

    calculateTotal(): void {
      this.estimatedTotal = this.cartItems.reduce(
        (acc, item) => acc + item.totalPriceForOneItemType,
        0
      );
    }

    increaseQuantity(item: ICartItem): void {
      const token = this.authService.getToken();

      if (token) {
        // لو يوزر مسجل دخول
        item.quantity++;
        item.totalPriceForOneItemType = item.unitPrice * item.quantity;

        this.cartService.updateCartItemQuantity(item).subscribe({
          next: () => this.calculateTotal(),
          error: (err) => {
            item.quantity--; // نرجّع الكمية القديمة

            Swal.fire({
              icon: 'error',
              title: 'Insufficient quantity available',
              text: 'The requested quantity exceeds the available stock.',
              showConfirmButton: false,
              timer: 2500,
            });
          },
        });
      } else {
        // Guest user 🧑‍🦲
        this.productDetailsService.getProductById(item.productId).subscribe({
          next: (res) => {
            const sizeObj = res.productSizes?.find(
              (s) => +s.id === +item.productSizeId // نعمل casting للأمان
            );

            if (!sizeObj) {
              Swal.fire({
                icon: 'error',
                title: 'Size not found',
                text: 'The selected size does not exist anymore.',
                showConfirmButton: false,
                timer: 2500,
              });
              return;
            }

            const availableStock = sizeObj?.stockQuantity || 0;

            if (item.quantity < availableStock) {
              item.quantity++;
              item.totalPriceForOneItemType = item.unitPrice * item.quantity;
              this.updateLocalCartItem(item);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Insufficient quantity available',
                text: `Only ${availableStock} left in stock.`,
                showConfirmButton: false,
                timer: 2500,
              });
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Something went wrong',
              text: 'Unable to verify available stock.',
            });
          },
        });
      }
    }

    decreaseQuantity(item: ICartItem): void {
      if (item.quantity <= 1) return;

      item.quantity--;
      item.totalPriceForOneItemType = item.unitPrice * item.quantity;

      if (this.authService.getToken()) {
        this.cartService.updateCartItemQuantity(item).subscribe({
          next: () => this.calculateTotal(),
          error: () => item.quantity++,
        });
      } else {
        this.updateLocalCartItem(item);
      }
    }

    removeItem(item: ICartItem): void {
      if (this.authService.getToken()) {
        this.cartService.deleteCartItem(item.id!). subscribe({
          next: () => {
            this.cartItems = this.cartItems.filter((ci) => ci.id !== item.id);
            this.calculateTotal();
            this.cartService.updateCartCount(this.cartItems.length); // تحديث عداد السلة
          },
        });
      } else {
        this.cartItems = this.cartItems.filter(
          (ci) =>
            ci.productId !== item.productId ||
            ci.productSizeId !== item.productSizeId
        );
        localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
        this.calculateTotal();
        this.cartService.updateCartCount(this.cartItems.length); // تحديث عداد السلة
      }
    }

    private updateLocalCartItem(updatedItem: ICartItem): void {
      const index = this.cartItems.findIndex(
        (ci) =>
          ci.productId === updatedItem.productId &&
          ci.productSizeId === updatedItem.productSizeId
      );

      if (index !== -1) {
        this.cartItems[index] = updatedItem;
        localStorage.setItem('guestCart', JSON.stringify(this.cartItems));
        this.calculateTotal();
        this.cartService.updateCartCount(this.cartItems.length); // تحديث عداد السلة
      }
    }

    closeCartBtn(): void {
      this.close.emit();
    }
    completeCheckout(): void {
      const token = this.authService.getToken();
      const isLoggedIn = !!token;

      if (!isLoggedIn) {
        this.isLoggedInNow = true;

        const dialogRef = this.dialog.open(Login, {
          panelClass: 'no-padding-dialog',
          backdropClass: 'custom-backdrop',
          width: '60%',
          maxWidth: 'none',
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result?.token) {
            // بعد تسجيل الدخول بنجاح، نقوم بتحميل سلة المستخدم من السيرفر
            this.loadServerCart();
            
            // نحفظ سلة الضيف في السيرفر إذا كانت موجودة
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
              const items = JSON.parse(guestCart);
              if (items && items.length > 0) {
                // أضف كل منتج من سلة الضيف إلى سلة المستخدم في السيرفر
                let completedItems = 0;
                items.forEach((item: ICartItem) => {
                  this.cartService.addGuestCartItem(item).subscribe({
                    next: () => {
                      completedItems++;
                      if (completedItems === items.length) {
                        // تحديث السلة بعد إضافة كل المنتجات
                        this.loadServerCart();
                      }
                    },
                  });
                });
                // نمسح سلة الضيف من localStorage
                localStorage.removeItem('guestCart');
              }
            }
            
            this.router.navigate(['/order']);
          }
        });
      } else {
        this.router.navigate(['/order']);
      }
    }
  }
