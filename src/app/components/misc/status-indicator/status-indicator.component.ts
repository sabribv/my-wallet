import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [],
  templateUrl: './status-indicator.component.html',
  styleUrl: './status-indicator.component.scss'
})
export class StatusIndicatorComponent {
  @Input() text = '';
  @Input() type: 'error' | 'info' | 'warning' | undefined = undefined;
}
