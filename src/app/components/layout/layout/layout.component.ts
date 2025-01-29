import {Component, inject} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {CommonModule} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {AuthService} from '@services/auth.service';
import {LayoutService} from '@services/layout.service';
import {combineLatest, filter, map, Observable, startWith, switchMap} from 'rxjs';

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
  routes = [
    { path: '/home', label: 'Home', icon: 'home', main: true },
    { path: '/wallets', label: 'Billeteras', icon: 'wallet', main: true },
    { path: '/bills', label: 'Cuentas por Pagar', icon: 'credit_card', main: true },
    { path: '/exchanges', label: 'Cambio de divisas', icon: 'currency_exchange', main: false },
    { path: '/calculator', label: 'Calculadora de cambio', icon: 'calculate', main: false },
    { path: '/expenses', label: 'Categorías de Gastos', icon: 'settings', main: false },
  ];
  title$: Observable<string | undefined>;

  sidenavMode$: Observable<any>;
  sidenavOpen$: Observable<boolean>;
  sidenavPosition$: Observable<any>;
  isMobileApp$: Observable<boolean>;

  constructor(private authService: AuthService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
  ) {

    this.title$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(this.router),
      switchMap(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route.title;
      }));

    this.sidenavMode$ = combineLatest([
      this.layoutService.isStandalone$,
      this.layoutService.isHandset$
    ]).pipe(
      map(([isStandalone, isHandset]) => {
        return isStandalone || isHandset ? 'over' : 'side'
    }));

    this.sidenavOpen$ = combineLatest([
      this.layoutService.isStandalone$,
      this.layoutService.isHandset$
    ]).pipe(
      map(([isStandalone, isHandset]) => {
        return !isStandalone && !isHandset
      }));

    this.isMobileApp$ = this.layoutService.isStandalone$;
    this.sidenavPosition$ = this.layoutService.isStandalone$.pipe(
      map(isStandalone => isStandalone ? 'end': 'start'),
    )
  }

  logout() {
    this.authService.logout();
  }
}
