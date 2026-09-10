import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  inject,
  signal
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  register(payload: any) {
    return this.http.post(
      'http://localhost:8090/auth/register',
      payload
    );
  }

  login(payload: any) {
    return this.http.post(
      'http://localhost:8090/auth/login',
      payload
    );
  }

  isLoggedIn(): boolean {

    return !!localStorage.getItem(
      'user'
    );

  }


  currentUser = signal<any>(null);

  setUser(user: any): void {

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );

    this.currentUser.set(user);

  }


  loadUser(): void {

    if (typeof window === 'undefined') {
      return;
    }

    const user =
      localStorage.getItem('user');

    this.currentUser.set(
      user ? JSON.parse(user) : null
    );

  }

  logout(): void {

    if (typeof window !== 'undefined') {

      localStorage.removeItem('user');
      this.currentUser.set(null);

    }

    

  }
}
