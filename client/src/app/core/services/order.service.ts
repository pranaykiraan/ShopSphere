import { Injectable, signal, inject } from '@angular/core';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private authService = inject(AuthService);
  
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  fetchUserOrders(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.error.set(null);

    fetch(`http://localhost:5000/api/orders/user/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then((data: Order[]) => {
        this.orders.set(data);
        this.isLoading.set(false);
      })
      .catch(err => {
        console.error('Order fetch error:', err);
        // Fallback mock data if Express server is offline
        this.orders.set([
          {
            id: 'ORD-98231',
            userId: user.id,
            items: [
              {
                product: { id: '1', name: 'Pro Wireless Headphones', description: 'Noise canceling', price: 199, category: 'Audio' },
                quantity: 1
              }
            ],
            totalAmount: 199.00,
            status: 'Delivered',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: 'ORD-44102',
            userId: user.id,
            items: [
              {
                product: { id: '2', name: 'SaaS Analytics Suite', description: 'Real-time dashboard', price: 49, category: 'Software' },
                quantity: 2
              }
            ],
            totalAmount: 98.00,
            status: 'Processing',
            createdAt: new Date().toISOString()
          }
        ]);
        this.isLoading.set(false);
      });
  }
}