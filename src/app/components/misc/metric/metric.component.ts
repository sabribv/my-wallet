import {Component, Input} from '@angular/core';
import {MatCardContent, MatCardHeader, MatCardModule, MatCardTitle} from "@angular/material/card";
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-metric',
  standalone: true,
  imports: [
    MatCardModule,
    CurrencyPipe,
  ],
  templateUrl: './metric.component.html',
  styleUrl: './metric.component.scss'
})
export class MetricComponent {
  @Input() counter: number = 0;
  @Input() text: string = '';
  @Input() type: 'default' | 'warning' | 'error' | undefined = undefined;
}
