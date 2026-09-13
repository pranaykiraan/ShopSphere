import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../app.component';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="product" class="modal-overlay" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        
        <!-- Header Banner -->
        <div class="modal-banner" [style.background]="getGradient(product.name)">
          <button (click)="close.emit()" class="close-btn">&times;</button>
          <span class="category-pill">{{ product.category }}</span>
          <div class="banner-avatar">{{ getInitials(product.name) }}</div>
        </div>

        <!-- Body Content -->
        <div class="modal-body">
          <h2 class="title">{{ product.name }}</h2>
          <span class="price-tag">\${{ product.price.toFixed(2) }}</span>
          
          <div class="divider"></div>

          <h3>Overview</h3>
          <p class="description">{{ product.description }}</p>

          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">Availability</span>
              <span class="spec-value stock-in">In Stock</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Item ID</span>
              <span class="spec-value">#{{ product.id }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-footer">
          <button (click)="close.emit()" class="btn btn-ghost">Close</button>
          <button (click)="onAdd()" class="btn btn-primary">Add to Cart • \${{ product.price.toFixed(2) }}</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
    }
    .modal-card {
      background: #ffffff; border-radius: 16px; width: 100%; max-width: 480px;
      overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      display: flex; flex-direction: column;
    }
    .modal-banner {
      height: 140px; position: relative; display: flex; align-items: center; justify-content: center;
    }
    .close-btn {
      position: absolute; top: 12px; right: 12px; background: rgba(255, 255, 255, 0.85);
      border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
      font-size: 1.25rem; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center;
    }
    .category-pill {
      position: absolute; top: 12px; left: 12px; background: rgba(255, 255, 255, 0.9);
      padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; color: #0f172a;
    }
    .banner-avatar {
      width: 64px; height: 64px; border-radius: 50%; background: rgba(255, 255, 255, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1.5rem; font-weight: 800;
    }
    .modal-body { padding: 24px; }
    .title { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .price-tag { font-size: 1.125rem; font-weight: 700; color: #2563eb; }
    .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
    .modal-body h3 { margin: 0 0 6px 0; font-size: 0.875rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .description { margin: 0 0 20px 0; color: #334155; font-size: 0.9375rem; line-height: 1.5; }
    
    .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 12px; border-radius: 10px; }
    .spec-item { display: flex; flex-direction: column; }
    .spec-label { font-size: 0.75rem; color: #64748b; }
    .spec-value { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    .stock-in { color: #16a34a; }

    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #fafafa; }
    .btn { padding: 10px 18px; font-size: 0.875rem; font-weight: 600; border-radius: 8px; border: none; cursor: pointer; }
    .btn-ghost { background: transparent; color: #64748b; }
    .btn-ghost:hover { background: #e2e8f0; }
    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
  `]
})
export class ProductDetailModalComponent {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<Product>();

  onAdd() {
    if (this.product) {
      this.addToCart.emit(this.product);
      this.close.emit();
    }
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
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%) 0%, hsl(${hue2}, 80%, 45%) 100%)`;
  }
}