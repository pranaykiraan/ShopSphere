import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'shopsphere_cart';

  cart = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  cartItemCount = computed(() => 
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  cartSubtotal = computed(() => 
    this.cart().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  );

  constructor() {
    this.restoreCart();
  }

  private restoreCart(): void {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (!savedCart) {
      return;
    }

    try {
      this.cart.set(JSON.parse(savedCart));
    } catch (error) {
      console.warn('Failed to parse saved cart state:', error);
    }
  }

  private saveCart(items: CartItem[]): void {
    this.cart.set(items);
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  }

  addToCart(product: Product) {
    const targetId = product.id || (product as any)._id || product.name;
    const currentCart = this.cart();
    const existingIndex = currentCart.findIndex(item => {
      const itemId = item.product.id || (item.product as any)._id || item.product.name;
      return itemId === targetId;
    });

    const updatedCart = [...currentCart];

    if (existingIndex > -1) {
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + 1
      };
    } else {
      updatedCart.push({ product: { ...product, id: targetId }, quantity: 1 });
    }

    this.saveCart(updatedCart);
    this.isCartOpen.set(true);
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      const filteredCart = this.cart().filter(item => {
        const itemId = item.product.id || (item.product as any)._id || item.product.name;
        return itemId !== productId;
      });

      this.saveCart(filteredCart);
      return;
    }

    const updatedCart = this.cart().map(item => {
      const itemId = item.product.id || (item.product as any)._id || item.product.name;
      return itemId === productId ? { ...item, quantity } : item;
    });

    this.saveCart(updatedCart);
  }

  clearCart() {
    this.cart.set([]);
    localStorage.removeItem(this.CART_KEY);
  }

  async checkout() {
    return { order: { id: `ORD-${Math.floor(10000 + Math.random() * 90000)}` } };
  }
}