import { HttpClient } from '@angular/common/http';

import {
  Injectable,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http =
    inject(HttpClient);

  private platformId =
    inject(PLATFORM_ID);

  readonly currentUser =
    signal<any>(null);

  private readonly baseUrl =
    'http://localhost:8090/auth';

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );
  }

  register(payload: any) {

    return this.http.post(
      `${this.baseUrl}/register`,
      payload
    );
  }

  login(payload: any) {

    return this.http.post(
      `${this.baseUrl}/login`,
      payload
    );
  }

  isLoggedIn(): boolean {

    if (!this.isBrowser()) {
      return false;
    }

    return !!localStorage.getItem(
      'token'
    );
  }

  setUser(response: any): void {

    const user = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role
    };

    this.currentUser.set(user);

    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(
      'token',
      response.token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );
  }

  loadUser(): void {

    if (!this.isBrowser()) {

      this.currentUser.set(null);

      return;
    }

    const user =
      localStorage.getItem('user');

    this.currentUser.set(
      user
        ? JSON.parse(user)
        : null
    );
  }

  logout(): void {

    this.currentUser.set(null);

    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  isUser(): boolean {

    const user =
      this.currentUser();

    return user?.role
      === 'ROLE_USER';
  }

  isGuest(): boolean {

    const user =
      this.currentUser();

    return user?.role
      === 'ROLE_GUEST';
  }

}
