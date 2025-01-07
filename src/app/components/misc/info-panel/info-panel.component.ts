import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss'
})
export class InfoPanelComponent {
  @Input() type: 'default' | 'warning' | 'error' | undefined = undefined;
}
