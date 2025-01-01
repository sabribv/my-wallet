import {Component, inject} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {CommonModule, NgFor} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {AuthService} from '@services/auth.service';
import {LayoutService} from '@services/layout.service';

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
    CommonModule,
    MatIconButton,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  layoutService = inject(LayoutService);
  isHandset$ = this.layoutService.isHandset$;
  routes = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/bills', label: 'Gastos mensuales', icon: 'payments' },
    { path: '/expenses', label: 'Gastos', icon: 'settings' },
  ];

  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
