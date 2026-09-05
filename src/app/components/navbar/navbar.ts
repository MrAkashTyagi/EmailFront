import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; // Location API add kiya jo server safe h
import { NavbarActionService } from '../../service/navbar-action-service';
import { effect } from '@angular/core';

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
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  protected navbarService = inject(NavbarActionService);
  private location = inject(Location); // SSR Safe location identifier

  public navBarService = inject(NavbarActionService);

  searchText = '';

  constructor() {

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
      return 'Add Family';
    }

    if (currentPath.includes('guests')) {
      return 'Add Guest';
    }

    if (currentPath.includes('expenses')) {
      return 'Add Expense';
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

    if (currentPath.includes('family')) {
      return `Families: ${this.navBarService.totalGuestCount()}`;
    }

    if (currentPath.includes('expenses')) {
      return `Expenses: ${this.navBarService.totalGuestCount()}`;
    }

    return `Guests: ${this.navBarService.totalGuestCount()}`;
  }

}
