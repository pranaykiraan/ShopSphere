import { Component, inject, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import * as animeImport from 'animejs';

const anime = (animeImport as any).default || animeImport;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="cartService.isCartOpen()" class="cart-overlay" (click)="closeCart()">
      <div class="cart-drawer" (click)="$event.stopPropagation()">
        <div class="cart-header">
          <h3>Your Shopping Cart</h3>
          <button (click)="closeCart()" class="close-btn">&times;</button>
        </div>

        <div class="cart-body">
          <div *ngIf="cartService.cart().length === 0" class="empty-cart">
            <p>Your cart is empty.</p>
          </div>

          <div *ngFor="let item of cartService.cart()" class="cart-item">
            <div class="cart-item-avatar" [style.background]="getGradient(item.product.name)">
              {{ getInitials(item.product.name) }}
            </div>
            <div class="cart-item-details">
              <h4>{{ item.product.name }}</h4>
              <p class="cart-item-price">\${{ item.product.price.toFixed(2) }}</p>
              
              <div class="quantity-controls">
                <button (click)="onUpdateQuantity(getProductId(item.product), item.quantity - 1, $event)" class="btn-qty">-</button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button (click)="onUpdateQuantity(getProductId(item.product), item.quantity + 1, $event)" class="btn-qty">+</button>
                <button (click)="onRemoveItem(getProductId(item.product), $event)" class="btn-remove">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="cartService.cart().length > 0" class="cart-footer">
          <div class="subtotal-row">
            <span>Subtotal</span>
            <span class="subtotal-amount">\${{ cartService.cartSubtotal().toFixed(2) }}</span>
          </div>
          <button (click)="onCheckout($event)" class="btn btn-primary btn-block checkout-btn">Proceed to Checkout</button>
          <button (click)="cartService.clearCart()" class="btn btn-ghost btn-block">Clear Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px); display: flex; justify-content: flex-end; z-index: 1000;
      opacity: 0;
    }
    .cart-drawer {
      width: 100%; max-width: 400px; background: #fff; height: 100%;
      display: flex; flex-direction: column; padding: 24px; box-sizing: border-box;
      box-shadow: -8px 0 32px rgba(15, 23, 42, 0.16);
      transform: translateX(100%);
    }
    .cart-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
    .cart-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: #0f172a; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; transition: transform 0.2s; }
    .close-btn:hover { transform: scale(1.15) rotate(90deg); color: #0f172a; }
    .cart-body { flex: 1; overflow-y: auto; padding: 16px 0; }
    .empty-cart { text-align: center; color: #64748b; margin-top: 40px; font-size: 0.875rem; }
    
    .cart-item { display: flex; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    .cart-item-avatar { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .cart-item-details { flex: 1; }
    .cart-item-details h4 { margin: 0 0 4px 0; font-size: 0.875rem; color: #0f172a; font-weight: 600; }
    .cart-item-price { margin: 0 0 8px 0; font-size: 0.8125rem; font-weight: 600; color: #64748b; }
    
    .quantity-controls { display: flex; align-items: center; gap: 8px; }
    .btn-qty { width: 26px; height: 26px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #0f172a; transition: background 0.2s; }
    .btn-qty:hover { background: #f8fafc; }
    .qty-val { font-size: 0.8125rem; font-weight: 600; }
    .btn-remove { background: none; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; margin-left: auto; font-weight: 500; }
    .btn-remove:hover { text-decoration: underline; }

    .cart-footer { border-top: 1px solid #e2e8f0; padding-top: 16px; }
    .subtotal-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 1rem; margin-bottom: 16px; color: #0f172a; }
    
    .btn { padding: 8px 16px; font-size: 0.875rem; font-weight: 500; border-radius: 8px; border: 1px solid transparent; cursor: pointer; }
    .btn-primary { background-color: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
    .btn-primary:hover { background-color: #1d4ed8; }
    .btn-ghost { background: transparent; color: #64748b; }
    .btn-ghost:hover { background: #f1f5f9; color: #0f172a; }
    .btn-block { width: 100%; padding: 10px; margin-top: 8px; }
  `]
})
export class CartDrawerComponent implements AfterViewInit {
  public cartService = inject(CartService);
  private el = inject(ElementRef);

  ngAfterViewInit() {
    this.animateOpen();
  }

  animateOpen() {
    const overlay = this.el.nativeElement.querySelector('.cart-overlay');
    const drawer = this.el.nativeElement.querySelector('.cart-drawer');

    if (overlay && drawer) {
      anime({
        targets: overlay,
        opacity: [0, 1],
        duration: 350,
        easing: 'easeOutQuad'
      });

      anime({
        targets: drawer,
        translateX: ['100%', '0%'],
        duration: 450,
        easing: 'spring(1, 90, 12, 0)'
      });

      anime({
        targets: '.cart-item',
        translateX: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(60, { start: 150 }),
        easing: 'easeOutCubic'
      });
    }
  }

  closeCart() {
    const overlay = this.el.nativeElement.querySelector('.cart-overlay');
    const drawer = this.el.nativeElement.querySelector('.cart-drawer');

    anime({
      targets: drawer,
      translateX: ['0%', '100%'],
      duration: 300,
      easing: 'easeInCubic'
    });

    anime({
      targets: overlay,
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuad',
      complete: () => {
        this.cartService.isCartOpen.set(false);
      }
    });
  }

  getProductId(product: any): string {
    return product.id || product._id || product.name;
  }

  onUpdateQuantity(productId: string, newQuantity: number, event?: MouseEvent) {
    if (event) {
      anime({
        targets: event.target,
        scale: [1, 0.8, 1.15, 1],
        duration: 300,
        easing: 'spring(1, 80, 10, 0)'
      });
    }
    this.cartService.updateQuantity(productId, newQuantity);
  }

  onRemoveItem(productId: string, event: MouseEvent) {
    const itemEl = (event.target as HTMLElement).closest('.cart-item');
    if (itemEl) {
      anime({
        targets: itemEl,
        translateX: [0, 60],
        opacity: [1, 0],
        height: 0,
        marginBottom: 0,
        paddingBottom: 0,
        duration: 300,
        easing: 'easeOutQuart',
        complete: () => {
          this.cartService.updateQuantity(productId, 0);
        }
      });
    } else {
      this.cartService.updateQuantity(productId, 0);
    }
  }

  onCheckout(event: MouseEvent) {
    anime({
      targets: event.target,
      scale: [1, 0.95, 1.05, 1],
      duration: 400,
      easing: 'spring(1, 80, 10, 0)',
      complete: () => {
        this.cartService.checkout().then(data => {
          alert(`Success! Order #${data.order.id} saved in database.`);
          this.cartService.clearCart();
          this.closeCart();
        });
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getGradient(seed: string): string {
    if (!seed) return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%) 0%, hsl(${hue2}, 80%, 45%) 100%)`;
  }
}