import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      
      <!-- Navbar -->
      <header class="navbar">
        <div class="logo" (click)="activeTab.set('catalog')">
          <span class="brand-name">ShopSphere</span>
        </div>
        
        <nav class="nav-actions">
          <button (click)="toggleCart()" class="btn btn-outline cart-btn">
            🛒 Cart
            <span *ngIf="cartItemCount() > 0" class="cart-badge">{{ cartItemCount() }}</span>
          </button>

          <ng-container *ngIf="currentUser(); else authButtons">
            <span class="user-greeting">Signed in as <strong>{{ currentUser().name }}</strong></span>
            <button (click)="logout()" class="btn btn-outline">Sign Out</button>
          </ng-container>
          <ng-template #authButtons>
            <button (click)="activeTab.set('login')" class="btn btn-ghost">Sign In</button>
            <button (click)="activeTab.set('signup')" class="btn btn-primary">Create Account</button>
          </ng-template>
        </nav>
      </header>

      <!-- Main Content / Catalog -->
      <main *ngIf="activeTab() === 'catalog'" class="content-wrapper">
        <div class="page-header">
          <h2>Product Catalog</h2>
          <p>Browse available items in our store.</p>
        </div>

        <div *ngIf="products().length === 0" class="empty-state">Loading products...</div>
        
        <div class="product-grid">
          <div *ngFor="let p of products()" class="product-card">
            <div class="image-container">
              <img [src]="p.imageUrl" [alt]="p.name" />
            </div>
            <div class="card-content">
              <h3>{{ p.name }}</h3>
              <p class="description">{{ p.description }}</p>
              <div class="card-footer">
                <span class="price">\${{ p.price.toFixed(2) }}</span>
                <button (click)="addToCart(p)" class="btn btn-secondary">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Cart Drawer / Modal -->
      <div *ngIf="isCartOpen()" class="cart-overlay" (click)="isCartOpen.set(false)">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <div class="cart-header">
            <h3>Your Shopping Cart</h3>
            <button (click)="isCartOpen.set(false)" class="close-btn">&times;</button>
          </div>

          <div class="cart-body">
            <div *ngIf="cart().length === 0" class="empty-cart">
              <p>Your cart is empty.</p>
            </div>

            <div *ngFor="let item of cart()" class="cart-item">
              <img [src]="item.product.imageUrl" [alt]="item.product.name" class="cart-item-img" />
              <div class="cart-item-details">
                <h4>{{ item.product.name }}</h4>
                <p class="cart-item-price">\${{ item.product.price.toFixed(2) }}</p>
                
                <div class="quantity-controls">
                  <button (click)="updateQuantity(item.product.id, item.quantity - 1)" class="btn-qty">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button (click)="updateQuantity(item.product.id, item.quantity + 1)" class="btn-qty">+</button>
                  <button (click)="updateQuantity(item.product.id, 0)" class="btn-remove">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="cart().length > 0" class="cart-footer">
            <div class="subtotal-row">
              <span>Subtotal</span>
              <span class="subtotal-amount">\${{ cartSubtotal().toFixed(2) }}</span>
            </div>
            <button (click)="checkout()" class="btn btn-primary btn-block">Proceed to Checkout</button>
            <button (click)="clearCart()" class="btn btn-ghost btn-block">Clear Cart</button>
          </div>
        </div>
      </div>

      <!-- Auth Views -->
      <main *ngIf="activeTab() === 'login'" class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          <div *ngIf="authError()" class="alert-error">{{ authError() }}</div>
          <div class="form-field">
            <label>Email address</label>
            <input [(ngModel)]="authForm.email" type="email" placeholder="you@example.com" />
          </div>
          <div class="form-field">
            <label>Password</label>
            <input [(ngModel)]="authForm.password" type="password" placeholder="••••••••" />
          </div>
          <button (click)="handleLogin()" class="btn btn-primary btn-block">Sign In</button>
          <div class="auth-footer">
            Don't have an account? <a (click)="activeTab.set('signup')">Sign up</a>
          </div>
        </div>
      </main>

      <main *ngIf="activeTab() === 'signup'" class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <h2>Create an Account</h2>
            <p>Start shopping with ShopSphere today</p>
          </div>
          <div *ngIf="authError()" class="alert-error">{{ authError() }}</div>
          <div class="form-field">
            <label>Full name</label>
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
          <button (click)="handleSignup()" class="btn btn-primary btn-block">Create Account</button>
          <div class="auth-footer">
            Already have an account? <a (click)="activeTab.set('login')">Sign in</a>
          </div>
        </div>
      </main>

    </div>
  `,
  styles: [`
    :host {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --bg-body: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --radius: 8px;
      display: block;
      min-height: 100vh;
      background-color: var(--bg-body);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .app-container { max-width: 1120px; margin: 0 auto; padding: 0 20px 40px; }
    
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      height: 64px; border-bottom: 1px solid var(--border-color);
      background: var(--bg-card); padding: 0 24px; margin-bottom: 32px;
    }
    .brand-name { font-size: 1.125rem; font-weight: 700; cursor: pointer; }
    .nav-actions { display: flex; align-items: center; gap: 12px; }
    .user-greeting { font-size: 0.875rem; color: var(--text-muted); }

    .btn {
      padding: 8px 16px; font-size: 0.875rem; font-weight: 500;
      border-radius: var(--radius); border: 1px solid transparent;
      cursor: pointer; transition: all 0.15s ease;
    }
    .btn-primary { background-color: var(--primary); color: #fff; }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .btn-secondary { background-color: #f1f5f9; color: var(--text-main); }
    .btn-secondary:hover { background-color: #e2e8f0; }
    .btn-ghost { background: transparent; color: var(--text-muted); }
    .btn-ghost:hover { color: var(--text-main); background: #f1f5f9; }
    .btn-outline { border-color: var(--border-color); background: transparent; color: var(--text-main); }
    .btn-outline:hover { background-color: #f8fafc; }
    .btn-block { width: 100%; padding: 10px; margin-top: 8px; }

    .cart-btn { position: relative; }
    .cart-badge {
      background: var(--primary); color: white; border-radius: 999px;
      padding: 2px 7px; font-size: 0.75rem; font-weight: 700; margin-left: 6px;
    }

    /* Product Grid */
    .page-header h2 { margin: 0 0 4px 0; font-size: 1.5rem; font-weight: 600; }
    .page-header p { margin: 0 0 24px 0; color: var(--text-muted); font-size: 0.875rem; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .product-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; }
    .image-container img { width: 100%; height: 160px; object-fit: cover; background-color: #f1f5f9; }
    .card-content { padding: 16px; }
    .card-content h3 { margin: 0 0 6px 0; font-size: 1rem; font-weight: 600; }
    .description { margin: 0 0 16px 0; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .price { font-weight: 600; font-size: 1rem; }

    /* Cart Drawer Overlay */
    .cart-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
      display: flex; justify-content: flex-end; z-index: 1000;
    }
    .cart-drawer {
      width: 100%; max-width: 400px; background: #fff; height: 100%;
      display: flex; flex-direction: column; padding: 24px; box-sizing: border-box;
      box-shadow: -4px 0 16px rgba(0,0,0,0.1);
    }
    .cart-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
    .cart-header h3 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
    .cart-body { flex: 1; overflow-y: auto; padding: 16px 0; }
    .empty-cart { text-align: center; color: var(--text-muted); margin-top: 40px; }
    
    .cart-item { display: flex; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
    .cart-item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
    .cart-item-details { flex: 1; }
    .cart-item-details h4 { margin: 0 0 4px 0; font-size: 0.875rem; }
    .cart-item-price { margin: 0 0 8px 0; font-size: 0.8125rem; font-weight: 600; }
    
    .quantity-controls { display: flex; align-items: center; gap: 8px; }
    .btn-qty { width: 24px; height: 24px; border: 1px solid var(--border-color); background: #fff; border-radius: 4px; cursor: pointer; }
    .qty-val { font-size: 0.8125rem; font-weight: 600; }
    .btn-remove { background: none; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; margin-left: auto; }

    .cart-footer { border-top: 1px solid var(--border-color); padding-top: 16px; }
    .subtotal-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 1rem; margin-bottom: 16px; }

    /* Auth Views */
    .auth-container { display: flex; justify-content: center; padding-top: 40px; }
    .auth-box { width: 100%; max-width: 380px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 32px; }
    .auth-header h2 { margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 600; }
    .auth-header p { margin: 0 0 24px 0; font-size: 0.875rem; color: var(--text-muted); }
    .form-field { margin-bottom: 16px; }
    .form-field label { display: block; font-size: 0.8125rem; font-weight: 500; margin-bottom: 6px; }
    .form-field input { width: 100%; padding: 8px 12px; font-size: 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius); box-sizing: border-box; }
    .auth-footer { margin-top: 20px; text-align: center; font-size: 0.8125rem; color: var(--text-muted); }
    .auth-footer a { color: var(--primary); text-decoration: none; cursor: pointer; }
    .alert-error { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px; border-radius: var(--radius); font-size: 0.8125rem; margin-bottom: 16px; }
  `]
})
export class AppComponent implements OnInit {
  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);
  activeTab = signal<'catalog' | 'login' | 'signup'>('catalog');
  currentUser = signal<any>(null);
  authError = signal<string>('');
  isCartOpen = signal<boolean>(false);

  authForm = { name: '', email: '', password: '' };

  cartItemCount = computed(() => 
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  cartSubtotal = computed(() =>
    this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  ngOnInit() {
    this.fetchProducts();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  fetchProducts() {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => this.products.set(data))
      .catch(err => console.error('Fetch error:', err));
  }

  toggleCart() {
    this.isCartOpen.update(v => !v);
  }

  addToCart(product: Product) {
    let currentCart = [...this.cart()];
    const index = currentCart.findIndex(item => item.product.id === product.id);

    if (index > -1) {
      currentCart[index].quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1 });
    }

    this.cart.set(currentCart);
    this.isCartOpen.set(true); // Open drawer automatically on add
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.cart.set(this.cart().filter(item => item.product.id !== productId));
    } else {
      this.cart.set(this.cart().map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  }

  clearCart() {
    this.cart.set([]);
  }

  // AFTER: Real checkout (sends data to backend)
checkout() {
  const orderPayload = { items: this.cart(), subtotal: this.cartSubtotal() };

  fetch('http://localhost:5000/api/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(res => res.json())
  .then(data => {
    alert(`Success! Order #${data.order.id} saved in database.`);
    this.clearCart();
  });
}

  handleLogin() {
    this.authError.set('');
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.authForm.email, password: this.authForm.password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
      if (res.status === 200) {
        this.saveSession(res.body);
      } else {
        this.authError.set(res.body.message || 'Login failed');
      }
    });
  }

  handleSignup() {
    this.authError.set('');
    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.authForm)
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
      if (res.status === 201) {
        this.saveSession(res.body);
      } else {
        this.authError.set(res.body.message || 'Signup failed');
      }
    });
  }

  saveSession(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUser.set(data.user);
    this.activeTab.set('catalog');
    this.authForm = { name: '', email: '', password: '' };
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}