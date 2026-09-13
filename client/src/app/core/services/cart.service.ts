import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  cartItemCount = computed(() => 
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  cartSubtotal = computed(() => 
    this.cart().reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  );

  addToCart(product: Product) {
    // Determine unique ID key regardless of whether MongoDB returns _id or id
    const targetId = product.id || (product as any)._id || product.name;

    this.cart.update(currentCart => {
      const existingIndex = currentCart.findIndex(item => {
        const itemId = item.product.id || (item.product as any)._id || item.product.name;
        return itemId === targetId;
      });

      if (existingIndex > -1) {
        // Product already exists in cart -> Increment quantity
        const updatedCart = [...currentCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // New unique product -> Add fresh deep copy
        return [...currentCart, { product: { ...product, id: targetId }, quantity: 1 }];
      }
    });

    this.isCartOpen.set(true);
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.cart.update(cart => cart.filter(item => {
        const itemId = item.product.id || (item.product as any)._id || item.product.name;
        return itemId !== productId;
      }));
    } else {
      this.cart.update(cart => 
        cart.map(item => {
          const itemId = item.product.id || (item.product as any)._id || item.product.name;
          return itemId === productId ? { ...item, quantity } : item;
        })
      );
    }
  }

  clearCart() {
    this.cart.set([]);
  }

  async checkout() {
    return { order: { id: `ORD-${Math.floor(10000 + Math.random() * 90000)}` } };
  }
}