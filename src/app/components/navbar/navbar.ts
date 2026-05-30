import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { CommonModule, Location } from '@angular/common'; // Location API add kiya jo server safe h
import { NavbarActionService } from '../../service/navbar-action-service';


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

  // 1. Safe path reader logic
  getPlaceholderText(): string {
    const currentPath = this.location.path();
    if (currentPath.includes('family')) return 'Search Family...';
    if (currentPath.includes('guests')) return 'Search Guest...';
    return 'Search here...';
  }

  // 2. Safe button reader logic
  getButtonText(): string {
    const currentPath = this.location.path();
    if (currentPath.includes('family')) return 'Add Family';
    if (currentPath.includes('guests')) return 'Add Guest';
    return 'Add New';
  }

  onSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.navbarService.searchQuery.set(filterValue);
  }

  onAddClick(): void {
    this.navbarService.triggerAddClick();
  }
}
