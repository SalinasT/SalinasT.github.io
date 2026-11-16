import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
//import { TripListing } from './trip-listing/trip-listing';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  imports: [ CommonModule, RouterOutlet, NavbarComponent], // RouterOutlet,
  selector: 'app-root',
  styleUrl: './app.css',
  standalone: true,
  templateUrl: './app.html',
})

export class App {
  protected readonly title = signal('Travlr Getaways Admin!');
}
