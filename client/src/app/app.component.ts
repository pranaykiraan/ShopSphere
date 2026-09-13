import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-layout">
      <!-- Navbar -->
      <header class="navbar">
        <h1 class="logo" (click)="activeTab.set('catalog')">ShopSphere</h1>

        <nav class="nav-right">
          <button (click)="activeTab.set('catalog')" [class.active]="activeTab() === 'catalog'" class="nav-btn">
            Catalog
          </button>

          <button (click)="isCartOpen.set(true)" class="nav-btn cart-btn">
            Cart <span class="badge" *ngIf="cartCount() > 0">{{ cartCount() }}</span>
          </button>

          <!-- Authenticated State -->
          <ng-container *ngIf="currentUser(); else authButtons">
            <button (click)="activeTab.set('orders')" [class.active]="activeTab() === 'orders'" class="nav-btn">
              My Orders
            </button>
            <span class="user-greeting">Signed in as <strong>{{ currentUser()?.name }}</strong></span>
            <button (click)="onLogout()" class="nav-btn outline-btn">Sign Out</button>
          </ng-container>

          <!-- Guest State -->
          <ng-template #authButtons>
            <button (click)="activeTab.set('login')" [class.active]="activeTab() === 'login'" class="nav-btn">
              Sign In
            </button>
            <button (click)="activeTab.set('signup')" class="nav-btn primary-btn">
              Create Account
            </button>
          </ng-template>
        </nav>
      </header>

      <!-- Main Content: Catalog View -->
      <main *ngIf="activeTab() === 'catalog'" class="main-content">
        <!-- Status Banner -->
        <div *ngIf="apiError()" class="status-banner">
          ⚠️ {{ apiError() }}
        </div>

        <!-- Toolbar Controls -->
        <div class="toolbar">
          <input 
            type="text" 
            placeholder="Search products..." 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            class="search-input"
          />

          <div class="category-pills">
            <button 
              *ngFor="let cat of categories()" 
              (click)="selectedCategory.set(cat)"
              [class.active]="selectedCategory() === cat"
              class="pill"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Skeleton Grid -->
        <div *ngIf="isLoading()" class="product-grid">
          <div *ngFor="let i of [1,2,3,4]" class="skeleton-card"></div>
        </div>

        <!-- Product Grid -->
        <div *ngIf="!isLoading()" class="product-grid">
          <div *ngFor="let p of filteredProducts()" class="product-card" (click)="selectedProduct.set(p)">
            
            <div class="card-banner" [style.background]="getGradient(p.name)">
              <span class="category-tag">{{ p.category }}</span>
              <div class="avatar">{{ getInitials(p.name) }}</div>
            </div>

            <div class="card-body">
              <h3 class="card-title">{{ p.name }}</h3>
              <p class="card-desc">{{ p.description }}</p>

              <div class="card-footer" (click)="$event.stopPropagation()">
                <div class="price-box">
                  <span class="price-label">Price</span>
                  <span class="price-val">\${{ p.price.toFixed(2) }}</span>
                </div>
                <button (click)="addToCart(p)" class="add-btn">Add to Cart</button>
              </div>
            </div>

          </div>
        </div>

        <div *ngIf="!isLoading() && filteredProducts().length === 0" class="empty-msg">
          No products match your search query.
        </div>
      </main>

      <!-- Main Content: Orders View -->
      <main *ngIf="activeTab() === 'orders'" class="main-content">
        <div class="view-header">
          <h2>Order History</h2>
          <p>Track your recent purchases and orders.</p>
        </div>
        <div class="empty-card">
          <p>You have no recent orders yet.</p>
        </div>
      </main>

      <!-- Auth Views: Sign In -->
      <main *ngIf="activeTab() === 'login'" class="auth-wrapper">
        <div class="auth-card">
          <h2>Sign In</h2>
          <p class="auth-sub">Enter your credentials to access your account</p>
          
          <div class="form-field">
            <label>Email address</label>
            <input [(ngModel)]="authForm.email" type="email" placeholder="you@example.com" />
          </div>
          <div class="form-field">
            <label>Password</label>
            <input [(ngModel)]="authForm.password" type="password" placeholder="••••••••" />
          </div>
          
          <button (click)="onLogin()" class="btn-full primary-btn">Sign In</button>
          
          <p class="auth-footer">
            Don't have an account? <a (click)="activeTab.set('signup')">Sign up</a>
          </p>
        </div>
      </main>

      <!-- Auth Views: Create Account -->
      <main *ngIf="activeTab() === 'signup'" class="auth-wrapper">
        <div class="auth-card">
          <h2>Create Account</h2>
          <p class="auth-sub">Start shopping with ShopSphere today</p>
          
          <div class="form-field">
            <label>Full Name</label>
            <input [(ngModel)]="authForm.name" type="text" placeholder="Jane Doe" />
          </div>
          <div class="form-field">
            <label>Email address</label>
            <input [(ngModel)]="authForm.email" type="email" placeholder="you@example.com" />
          </div>
          <div class="form-field">
            <label>Password</label>
            <input [(ngModel)]="authForm.password" type="password" placeholder="••••••••" />
          </div>
          
          <button (click)="onSignup()" class="btn-full primary-btn">Create Account</button>
          
          <p class="auth-footer">
            Already have an account? <a (click)="activeTab.set('login')">Sign in</a>
          </p>
        </div>
      </main>

      <!-- Product Detail Modal -->
      <div *ngIf="selectedProduct() as modalProd" class="modal-overlay" (click)="selectedProduct.set(null)">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-banner" [style.background]="getGradient(modalProd.name)">
            <button (click)="selectedProduct.set(null)" class="close-btn">&times;</button>
            <span class="modal-cat">{{ modalProd.category }}</span>
            <div class="modal-avatar">{{ getInitials(modalProd.name) }}</div>
          </div>
          
          <div class="modal-body">
            <h2>{{ modalProd.name }}</h2>
            <span class="modal-price">\${{ modalProd.price.toFixed(2) }}</span>
            <p class="modal-desc">{{ modalProd.description }}</p>
            
            <div class="spec-box">
              <div><span>Status:</span> <strong>In Stock</strong></div>
              <div><span>Product ID:</span> <strong>#{{ modalProd.id }}</strong></div>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="selectedProduct.set(null)" class="btn btn-ghost">Close</button>
            <button (click)="addToCart(modalProd); selectedProduct.set(null)" class="btn btn-primary">
              Add to Cart • \${{ modalProd.price.toFixed(2) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Drawer -->
      <div *ngIf="isCartOpen()" class="cart-overlay" (click)="isCartOpen.set(false)">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h2>Your Shopping Cart</h2>
            <button (click)="isCartOpen.set(false)" class="close-btn">&times;</button>
          </div>

          <div class="drawer-body">
            <div *ngIf="cart().length === 0" class="empty-msg">Your cart is empty.</div>

            <div *ngFor="let item of cart()" class="cart-row">
              <div>
                <strong>{{ item.product.name }}</strong>
                <div class="cart-price">\${{ item.product.price.toFixed(2) }} × {{ item.quantity }}</div>
              </div>
              <div class="qty-actions">
                <button (click)="updateQuantity(item.product.id, item.quantity - 1)">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="updateQuantity(item.product.id, item.quantity + 1)">+</button>
              </div>
            </div>
          </div>

          <div *ngIf="cart().length > 0" class="drawer-footer">
            <div class="subtotal">
              <span>Total:</span>
              <strong>\${{ cartSubtotal().toFixed(2) }}</strong>
            </div>
            <button (click)="clearCart()" class="clear-btn">Clear Cart</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      min-height: 100vh;
    }
    .app-layout { max-width: 1100px; margin: 0 auto; padding: 24px 20px; }

    /* Navbar */
    .navbar { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 14px 24px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .logo { margin: 0; font-size: 1.25rem; font-weight: 700; color: #2563eb; cursor: pointer; }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .nav-btn { background: transparent; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.875rem; color: #475569; }
    .nav-btn.active { background: #f1f5f9; color: #2563eb; font-weight: 600; }
    .cart-btn { background: #2563eb; color: #fff; border: none; }
    .primary-btn { background: #2563eb; color: #fff; border: none; font-weight: 600; }
    .outline-btn { background: #fff; border-color: #cbd5e1; }
    .badge { background: #fff; color: #2563eb; border-radius: 999px; padding: 2px 7px; font-size: 0.75rem; margin-left: 6px; font-weight: 700; }
    .user-greeting { font-size: 0.875rem; color: #64748b; }

    /* Status Banner & Skeleton */
    .status-banner { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 8px 14px; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; margin-bottom: 16px; }
    .skeleton-card { height: 260px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 16px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Toolbar */
    .toolbar { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
    .search-input { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.875rem; width: 100%; max-width: 320px; background: #fff; outline: none; }
    .search-input:focus { border-color: #2563eb; }
    .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill { padding: 6px 16px; border-radius: 999px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer; font-size: 0.8125rem; font-weight: 500; transition: all 0.2s; }
    .pill.active { background: #2563eb; color: #fff; border-color: #2563eb; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25); }

    /* Product Grid */
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .product-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.08); border-color: #cbd5e1; }
    .card-banner { height: 130px; position: relative; display: flex; align-items: center; justify-content: center; }
    .category-tag { position: absolute; top: 12px; left: 12px; background: rgba(255, 255, 255, 0.9); padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; color: #0f172a; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255, 255, 255, 0.25); border: 2px solid rgba(255, 255, 255, 0.4); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.25rem; font-weight: 800; }
    .card-body { padding: 18px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; }
    .card-title { margin: 0 0 6px 0; font-size: 1rem; font-weight: 600; color: #0f172a; }
    .card-desc { margin: 0 0 16px 0; color: #64748b; font-size: 0.8125rem; line-height: 1.4; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .price-box { display: flex; flex-direction: column; }
    .price-label { font-size: 0.6875rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    .price-val { font-size: 1.05rem; font-weight: 700; color: #0f172a; }
    .add-btn { background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8125rem; font-weight: 600; }

    /* Auth Styling */
    .auth-wrapper { display: flex; justify-content: center; padding-top: 40px; }
    .auth-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; width: 100%; max-width: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .auth-card h2 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 700; }
    .auth-sub { margin: 0 0 24px 0; font-size: 0.875rem; color: #64748b; }
    .form-field { margin-bottom: 16px; }
    .form-field label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: #334155; }
    .form-field input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box; }
    .btn-full { width: 100%; padding: 10px; border-radius: 8px; font-size: 0.875rem; cursor: pointer; margin-top: 8px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.8125rem; color: #64748b; }
    .auth-footer a { color: #2563eb; text-decoration: none; cursor: pointer; font-weight: 600; }

    /* Orders View */
    .view-header h2 { margin: 0 0 4px 0; font-size: 1.25rem; }
    .view-header p { margin: 0 0 20px 0; color: #64748b; font-size: 0.875rem; }
    .empty-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; color: #64748b; }

    /* Modal & Cart */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal-card { background: #fff; border-radius: 16px; width: 100%; max-width: 440px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal-banner { height: 130px; position: relative; display: flex; align-items: center; justify-content: center; }
    .modal-cat { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .modal-avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; font-weight: 800; }
    .modal-body { padding: 20px; }
    .modal-body h2 { margin: 0 0 4px 0; font-size: 1.25rem; }
    .modal-price { color: #2563eb; font-weight: 700; font-size: 1.1rem; }
    .modal-desc { margin: 12px 0 16px 0; color: #475569; font-size: 0.875rem; line-height: 1.5; }
    .spec-box { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 0.8125rem; display: flex; justify-content: space-between; }
    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 20px; border-top: 1px solid #e2e8f0; background: #fafafa; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; border: none; cursor: pointer; }
    .btn-ghost { background: transparent; color: #64748b; }
    .btn-primary { background: #2563eb; color: #fff; }

    .cart-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; justify-content: flex-end; z-index: 1000; }
    .cart-drawer { width: 100%; max-width: 380px; background: #fff; height: 100%; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; }
    .drawer-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .drawer-header h2 { margin: 0; font-size: 1.1rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 16px 0; }
    .cart-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .cart-price { font-size: 0.8125rem; color: #64748b; }
    .qty-actions { display: flex; align-items: center; gap: 8px; }
    .qty-actions button { width: 26px; height: 26px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .drawer-footer { border-top: 1px solid #e2e8f0; padding-top: 16px; }
    .subtotal { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.05rem; font-weight: 600; }
    .clear-btn { width: 100%; padding: 10px; border: 1px solid #ef4444; color: #ef4444; background: transparent; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .empty-msg { text-align: center; color: #64748b; margin: 30px 0; font-size: 0.875rem; }
  `]
})
export class AppComponent implements OnInit {
  // Navigation & User Signals
  activeTab = signal<'catalog' | 'login' | 'signup' | 'orders'>('catalog');
  currentUser = signal<User | null>(null);
  
  // UI Control Signals
  isCartOpen = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  apiError = signal<string | null>(null);

  // Search & Filter Signals
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');

  // Products & Cart Signals
  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);

  // Auth Form State
  authForm = { name: '', email: '', password: '' };

  // Computed Values
  categories = computed(() => ['All', ...Array.from(new Set(this.products().map(p => p.category)))]);

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.products().filter(p => {
      const matchesCat = cat === 'All' || p.category === cat;
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  });

  cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  cartSubtotal = computed(() => this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.isLoading.set(true);
    this.apiError.set(null);

    fetch('http://localhost:5000/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Server status ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        const formatted: Product[] = data.map((p, idx) => ({
          id: p.id || p._id || `prod-${idx}`,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          category: p.category || 'General'
        }));
        this.products.set(formatted);
        this.isLoading.set(false);
      })
      .catch(err => {
        console.warn('Backend API connection failed, falling back to mock dataset:', err.message);
        this.apiError.set('Backend offline — using local dataset');
        
        this.products.set([
          { id: '1', name: 'Wireless Headphones', description: 'High-fidelity audio with active noise cancellation.', price: 199.99, category: 'Audio' },
          { id: '2', name: 'Mechanical Keyboard', description: 'Tactile mechanical switches with customizable backlighting.', price: 129.50, category: 'Electronics' },
          { id: '3', name: 'Precision Wireless Mouse', description: 'Ergonomic mouse with customizable side buttons.', price: 79.99, category: 'Accessories' },
          { id: '4', name: 'SaaS Analytics Suite', description: 'Real-time telemetry and reporting software license.', price: 49.00, category: 'Software' }
        ]);
        this.isLoading.set(false);
      });
  }

  onLogin() {
    if (this.authForm.email) {
      this.currentUser.set({
        name: this.authForm.email.split('@')[0],
        email: this.authForm.email
      });
      this.activeTab.set('catalog');
      this.authForm = { name: '', email: '', password: '' };
    }
  }

  onSignup() {
    if (this.authForm.email && this.authForm.name) {
      this.currentUser.set({
        name: this.authForm.name,
        email: this.authForm.email
      });
      this.activeTab.set('catalog');
      this.authForm = { name: '', email: '', password: '' };
    }
  }

  onLogout() {
    this.currentUser.set(null);
    this.activeTab.set('catalog');
  }

  addToCart(product: Product) {
    this.cart.update(currentCart => {
      const idx = currentCart.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const copy = [...currentCart];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...currentCart, { product, quantity: 1 }];
    });
    this.isCartOpen.set(true);
  }

  updateQuantity(productId: string, newQty: number) {
    if (newQty <= 0) {
      this.cart.update(c => c.filter(item => item.product.id !== productId));
    } else {
      this.cart.update(c => c.map(item => item.product.id === productId ? { ...item, quantity: newQty } : item));
    }
  }

  clearCart() {
    this.cart.set([]);
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