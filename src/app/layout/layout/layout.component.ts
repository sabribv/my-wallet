import { Component } from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {NgFor} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    NgFor,
    MatIconButton,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  routes = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/profile', label: 'Profile', icon: 'person' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
