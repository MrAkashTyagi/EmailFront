import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbarModule, 
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatMenuModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {}
