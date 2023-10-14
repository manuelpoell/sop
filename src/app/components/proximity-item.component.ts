import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Proximity } from '../models/proximity.model';

@Component({
  selector: 'app-proximity-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="proximity-list-entry">
      <span>{{ item.name }}</span>
      <span>{{ item.distance }}{{ item.unit }}</span>
    </div>
  `,
  styleUrls: ['./proximity-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProximityItemComponent {
  @Input() item!: Proximity;
}
