import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  isHandset$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }
}
