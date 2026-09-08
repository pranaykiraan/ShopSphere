import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px; font-family: sans-serif;">
      <h1>🛍️ ShopSphere Catalog</h1>
      
      <div *ngIf="products().length === 0" style="color: #666; font-style: italic;">
        Loading products from server...
      </div>

      <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px;">
        <div *ngFor="let p of products()" style="border: 1px solid #ddd; padding: 20px; border-radius: 10px; width: 280px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <img [src]="p.imageUrl" [alt]="p.name" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px;" />
          <h3 style="margin: 15px 0 10px 0;">{{ p.name }}</h3>
          <p style="color: #555; font-size: 14px; line-height: 1.4;">{{ p.description }}</p>
          <strong style="font-size: 18px; color: #2e7d32;">\${{ p.price }}</strong>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  products = signal<any[]>([]);

  ngOnInit() {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        console.log('Setting signal data:', data);
        this.products.set(data);
      })
      .catch(err => console.error('Fetch failed:', err));
  }
}