import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Injectable} from '@angular/core';
import {map, Observable, of} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  isStandalone$: Observable<boolean>;
  isHandset$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));

    const isStandaloneIOS =
      'standalone' in window.navigator && (window.navigator as any).standalone;
    const isStandaloneAndroid = window.matchMedia('(display-mode: standalone)').matches;
    // this.isStandalone$ = of(true);
    this.isStandalone$ = of(isStandaloneIOS || isStandaloneAndroid);
  }
}
