import { Injectable, signal } from '@angular/core';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  authError = signal<string>('');

  constructor() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: { email: ''; password: '' }) {
    this.authError.set('');
    return fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
      if (res.status === 200) {
        this.saveSession(res.body);
        return true;
      } else {
        this.authError.set(res.body.message || 'Login failed');
        return false;
      }
    });
  }

  register(userData: { name: ''; email: ''; password: '' }) {
    this.authError.set('');
    return fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(res => {
      if (res.status === 201) {
        this.saveSession(res.body);
        return true;
      } else {
        this.authError.set(res.body.message || 'Signup failed');
        return false;
      }
    });
  }

  private saveSession(data: AuthResponse) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}