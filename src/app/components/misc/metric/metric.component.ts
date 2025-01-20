import {Component, Input} from '@angular/core';
import {MatCardContent, MatCardHeader, MatCardModule, MatCardTitle} from "@angular/material/card";
import {CurrencyPipe, DecimalPipe, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-metric',
  standalone: true,
  imports: [
    MatCardModule,
    CurrencyPipe,
    MatIcon,
    NgIf,
    DecimalPipe,
  ],
  templateUrl: './metric.component.html',
  styleUrl: './metric.component.scss'
})
export class MetricComponent {
  @Input() icon: string = '';
  @Input() counter: number = 0;
  @Input() text: string = '';
  @Input() type: 'default' | 'warning' | 'error' | undefined = undefined;
}
