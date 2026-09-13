import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import * as animeImport from 'animejs';

const anime = (animeImport as any).default || animeImport;

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-wrapper" (click)="cardClick.emit(product)">
      <!-- Visual Banner / Header -->
      <div class="card-banner" [style.background]="getGradient(product?.name || '')">
        <span class="category-badge">{{ product?.category || 'General' }}</span>
        <div class="banner-avatar">
          <span>{{ getInitials(product?.name || '') }}</span>
        </div>
      </div>

      <!-- Card Body Content -->
      <div class="card-body">
        <h3 class="product-title" [title]="product?.name || ''">{{ product?.name || 'Untitled Product' }}</h3>
        <p class="product-desc">{{ product?.description || 'No description available.' }}</p>

        <!-- Footer / Action Area -->
        <div class="card-footer" (click)="$event.stopPropagation()">
          <div class="price-container">
            <span class="price-label">Price</span>
            <span class="price-val">\${{ (product?.price || 0).toFixed(2) }}</span>
          </div>

          <button (click)="onAddToCart($event)" class="add-cart-btn">
            <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 01-8 0"></path>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .card-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
      position: relative;
    }

    .card-wrapper:hover {
      border-color: #cbd5e1;
      box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08);
    }

    /* Banner Area */
    .card-banner {
      height: 140px;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .category-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      color: #0f172a;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .banner-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(6px);
      border: 2px solid rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .card-wrapper:hover .banner-avatar {
      transform: scale(1.1);
    }

    /* Content Area */
    .card-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-title {
      margin: 0 0 6px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-desc {
      margin: 0 0 16px 0;
      font-size: 0.8125rem;
      color: #64748b;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    /* Footer Action Bar */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .price-container {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 600;
    }

    .price-val {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
    }

    .add-cart-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
      transition: background-color 0.2s ease;
    }

    .add-cart-btn:hover {
      background: #1d4ed8;
    }

    .cart-icon {
      width: 14px;
      height: 14px;
    }
  `]
})
export class ProductCardComponent implements AfterViewInit {
  @Input({ required: true }) product!: Product;
  @Output() cardClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const cardEl = this.el.nativeElement.querySelector('.card-wrapper');
    if (cardEl) {
      anime({
        targets: cardEl,
        translateY: [16, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  }

  onAddToCart(event: MouseEvent) {
    const btn = event.currentTarget as HTMLElement;

    anime({
      targets: btn,
      scale: [1, 0.88, 1.08, 1],
      duration: 300,
      easing: 'spring(1, 90, 10, 0)',
      complete: () => {
        this.addToCart.emit(this.product);
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