import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; // Location API add kiya jo server safe h
import { NavbarActionService } from '../../service/navbar-action-service';
import { effect } from '@angular/core';
import { MatCardImage } from "@angular/material/card";
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
    MatCardImage
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  protected navbarService = inject(NavbarActionService);
  private location = inject(Location); // SSR Safe location identifier

  public navBarService = inject(NavbarActionService);

  searchText = '';
  public authService = inject(AuthService);
  private router = inject(Router);

  currentUser =
    this.authService.currentUser;


  // ngOnInit(): void {

  //   if (
  //     typeof window !== 'undefined'
  //   ) {

  //     const user =
  //       localStorage.getItem('user');

  //     if (user) {

  //       this.currentUser =
  //         JSON.parse(user);

  //     }

  //   }

  // }

  constructor() {

      this.authService.loadUser();

    effect(() => {


      this.searchText =
        this.navBarService.searchQuery();

    });

  }

  onExportClick() {
    this.navBarService.triggerExportClick();
  }

  // 1. Safe path reader logic
  getPlaceholderText(): string {
    const currentPath = this.location.path();

    if (currentPath.includes('family')) {
      return 'Search Family...';
    }

    if (currentPath.includes('guests')) {
      return 'Search Guest...';
    }

    if (currentPath.includes('expenses')) {
      return 'Search Expense...';
    }

    return 'Search here...';
  }
  // 2. Safe button reader logic
  getButtonText(): string {
    const currentPath = this.location.path();

    if (currentPath.includes('family')) {
      return ' Family';
    }

    if (currentPath.includes('guests')) {
      return ' Guest';
    }

    if (currentPath.includes('expenses')) {
      return ' Expense';
    }

    return 'Add New';
  }

  onSearch(event: Event): void {

    this.searchText =
      (event.target as HTMLInputElement).value;

    this.navbarService.searchQuery.set(
      this.searchText
    );

  }

  onAddClick(): void {
    this.navbarService.triggerAddClick();
  }

  getCountLabel(): string {
    const currentPath = this.location.path();

    if (currentPath.includes('dashboard')) {
      return 'Wedding Overview';
    }

    if (currentPath.includes('family')) {
      return `Families: ${this.navBarService.totalGuestCount()}`;
    }

    if (currentPath.includes('expenses')) {
      return `Expenses: ${this.navBarService.totalGuestCount()}`;
    }

    if (currentPath.includes('guests')) {
      return `Guests: ${this.navBarService.totalGuestCount()}`;
    }

    return 'Wedding Management';
  }

  isDashboardPage(): boolean {
    return this.location.path().includes('dashboard');
  }

  isGuestPage(): boolean {
    return this.location.path().includes('guests');
  }

  isFamilyPage(): boolean {
    return this.location.path().includes('family');
  }

  isExpensePage(): boolean {
    return this.location.path().includes('expenses');
  }

  // logout(): void {

  //   if (
  //     typeof window !== 'undefined'
  //   ) {

  //     localStorage.removeItem('user');

  //   }

  //   this.router.navigate([
  //     '/login'
  //   ]);

  // }

  logout(): void {

  this.authService.logout();

  this.router.navigate([
    '/login'
  ]);

}

}
