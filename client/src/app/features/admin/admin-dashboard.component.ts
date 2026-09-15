import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, Order } from '../../app.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="main-content">
      <div class="view-header">
        <h2>Admin Inventory & Analytics</h2>
        <p>Monitor platform performance and publish new products to the catalog.</p>
      </div>

      <!-- Analytics Metrics Bar -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Total Revenue</span>
          <span class="metric-value">\${{ totalRevenue().toFixed(2) }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Completed Orders</span>
          <span class="metric-value">{{ orders.length }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Units Sold</span>
          <span class="metric-value">{{ totalItemsSold() }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Total Inventory</span>
          <span class="metric-value">{{ products.length }}</span>
        </div>
      </div>

      <div class="admin-grid">
        <!-- Add Product Form -->
        <div class="admin-card">
          <h3>Add New Inventory</h3>
          <div class="form-field">
            <label>Product Title</label>
            <input [(ngModel)]="newProduct.name" type="text" placeholder="e.g. Ultra Wireless Mouse" />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Category</label>
              <select [(ngModel)]="newProduct.category" class="select-input">
                <option value="Electronics">Electronics</option>
                <option value="Audio">Audio</option>
                <option value="Accessories">Accessories</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div class="form-field">
              <label>Price ($)</label>
              <input [(ngModel)]="newProduct.price" type="number" step="0.01" />
            </div>
          </div>

          <div class="form-field">
            <label>Description</label>
            <textarea [(ngModel)]="newProduct.description" rows="3" placeholder="Product features and specifications..."></textarea>
          </div>

          <button (click)="onCreateProduct()" [disabled]="isSubmittingProduct()" class="checkout-btn">
            {{ isSubmittingProduct() ? 'Publishing...' : 'Publish Product' }}
          </button>
        </div>

        <!-- Active Inventory Summary -->
        <div class="admin-card">
          <h3>Product Catalog ({{ products.length }})</h3>
          <div class="inventory-list">
            <div *ngFor="let p of products" class="inventory-item">
              <div>
                <strong>{{ p.name }}</strong>
                <div class="inventory-meta">{{ p.category }} • \${{ p.price.toFixed(2) }}</div>
              </div>
              <span class="stock-badge">In Stock</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .main-content { padding-top: 10px; }
    .view-header h2 { margin: 0 0 4px 0; font-size: 1.25rem; }
    .view-header p { margin: 0 0 20px 0; color: #64748b; font-size: 0.875rem; }
    
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; }
    .metric-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
    .metric-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; }

    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .admin-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
    .admin-card h3 { margin: 0 0 16px 0; font-size: 1.1rem; }

    .form-field { margin-bottom: 16px; }
    .form-field label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: #334155; }
    .form-field input, .select-input, textarea { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box; background: #fff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .checkout-btn {
      width: 100%;
      background: #2563eb !important;
      color: #ffffff !important;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 700 !important;
      cursor: pointer;
      margin-top: 8px;
    }
    .checkout-btn:hover:not(:disabled) { background: #1d4ed8 !important; }
    .checkout-btn:disabled { background: #94a3b8 !important; cursor: not-allowed; }

    .inventory-list { max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    .inventory-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #f1f5f9; border-radius: 8px; background: #f8fafc; }
    .inventory-meta { font-size: 0.8125rem; color: #64748b; margin-top: 2px; }
    .stock-badge { background: #dcfce7; color: #166534; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 999px; }
  `]
})
export class AdminDashboardComponent {
  @Input() products: Product[] = [];
  @Input() orders: Order[] = [];
  @Output() productCreated = new EventEmitter<void>();

  isSubmittingProduct = signal<boolean>(false);

  newProduct = {
    name: '',
    description: '',
    price: 0,
    category: 'Electronics'
  };

  totalRevenue = computed(() => 
    this.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  );

  totalItemsSold = computed(() => 
    this.orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
  );

  onCreateProduct() {
    if (!this.newProduct.name || this.newProduct.price <= 0) {
      alert('Please provide a valid product name and price.');
      return;
    }

    this.isSubmittingProduct.set(true);

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.newProduct)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
      })
      .then(() => {
        alert('Product created successfully!');
        this.newProduct = { name: '', description: '', price: 0, category: 'Electronics' };
        this.isSubmittingProduct.set(false);
        this.productCreated.emit();
      })
      .catch(err => {
        console.warn('API creation failed:', err.message);
        alert('Failed to connect to backend server.');
        this.isSubmittingProduct.set(false);
      });
  }
}