import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  products = signal<Product[]>([]);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');

  // Dynamically derive unique categories from loaded products
  categories = computed(() => {
    const cats = this.products().map((p: Product) => p.category || 'General');
    return ['All', ...Array.from(new Set(cats))];
  });

  // Filter products by active category pill and search query
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.products().filter((p: Product) => {
      const pCat = p.category || 'General';
      const matchesCategory = category === 'All' || pCat === category;
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  fetchProducts() {
  fetch('http://localhost:5000/api/products')
    .then(res => res.json())
    .then((data: any[]) => {
      const categoriesList = ['Electronics', 'Audio', 'Accessories', 'Software'];
      
      const enrichedData: Product[] = data.map((p, index) => ({
        ...p,
        // Guarantee unique id mapping even if backend returns _id or missing id
        id: p.id || p._id || `prod-${index}-${Date.now()}`,
        category: p.category || categoriesList[index % categoriesList.length]
      }));
      
      this.products.set(enrichedData);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      // Fallback mock data with guaranteed unique IDs
      this.products.set([
        { id: 'prod-1', name: 'Pro Wireless Headphones', description: 'Noise canceling', price: 199, category: 'Audio' },
        { id: 'prod-2', name: 'SaaS Analytics Suite', description: 'Real-time dashboard', price: 49, category: 'Software' },
        { id: 'prod-3', name: 'Mechanical Keyboard', description: 'RGB Switches', price: 129, category: 'Electronics' },
        { id: 'prod-4', name: 'Ergonomic Mouse', description: 'Precision sensor', price: 79, category: 'Accessories' }
      ]);
    });
}
}