import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container">
      <div class="page-header">
        <h2>Your Order History</h2>
        <p>View details and status updates for your past purchases.</p>
      </div>

      <div *ngIf="orderService.isLoading()" class="empty-state">Loading your order history...</div>

      <div *ngIf="!orderService.isLoading() && orderService.orders().length === 0" class="empty-state">
        You haven't placed any orders yet.
      </div>

      <div *ngIf="!orderService.isLoading() && orderService.orders().length > 0" class="order-list">
        <div *ngFor="let order of orderService.orders()" class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">#{{ order.id }}</span>
              <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
            </div>
            <span class="status-badge" [ngClass]="order.status.toLowerCase()">
              {{ order.status }}
            </span>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.items" class="order-item-row">
              <span class="item-name">{{ item.product.name }} &times; {{ item.quantity }}</span>
              <span class="item-price">\${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <span>Total Amount</span>
            <strong>\${{ order.totalAmount.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { max-width: 800px; margin: 0 auto; }
    .page-header h2 { margin: 0 0 4px 0; font-size: 1.5rem; font-weight: 600; }
    .page-header p { margin: 0 0 24px 0; color: #64748b; font-size: 0.875rem; }
    
    .empty-state { text-align: center; color: #64748b; margin: 40px 0; font-size: 0.9375rem; }
    
    .order-list { display: flex; flex-direction: column; gap: 16px; }
    .order-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    
    .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 12px; }
    .order-id { font-weight: 700; color: #0f172a; margin-right: 12px; font-size: 0.9375rem; }
    .order-date { color: #64748b; font-size: 0.8125rem; }
    
    .status-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .status-badge.processing { background: #fef3c7; color: #d97706; }
    .status-badge.shipped { background: #e0f2fe; color: #0369a1; }
    .status-badge.delivered { background: #dcfce7; color: #15803d; }
    .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

    .order-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .order-item-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: #334155; }
    
    .order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 0.9375rem; }
    .order-footer strong { font-size: 1.1rem; color: #0f172a; }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orderService = inject(OrderService);

  ngOnInit() {
    this.orderService.fetchUserOrders();
  }
}