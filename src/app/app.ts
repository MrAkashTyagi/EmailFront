import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Home } from "./components/home/home";
import { Navbar } from "./components/navbar/navbar";


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Home,
    Navbar,
    RouterLink   
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('EmailFront');
}
