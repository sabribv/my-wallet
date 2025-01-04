import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AsyncPipe, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {filter, Observable} from 'rxjs';
import {LayoutService} from '@services/layout.service';
import {MatIcon} from '@angular/material/icon';
import {SwUpdate, VersionReadyEvent} from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MatButton, AsyncPipe, MatIconButton, MatIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'my-wallet';
  deferredPrompt: any = null; // Guardar el evento `beforeinstallprompt`
  showInstallButton = false;
  isPwaInstalled = true;
  isMobile$: Observable<boolean>;
  updateAvailable = false;

  constructor(private swUpdate: SwUpdate, private layoutService: LayoutService) {
    this.isMobile$ = this.layoutService.isHandset$;
  }

  ngOnInit(): void {
    this.isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.showInstallButton = true;
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable = true;
          this.showInstallButton = true;
        });
    }
  }

  installPwa(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA instalada');
        } else {
          console.log('PWA no instalada');
        }
        this.deferredPrompt = null;
      });
    }
  }

  reloadApp(): void {
    window.location.reload();
  }

  closeInstallPanel() {
    this.showInstallButton = false;
  }
}
