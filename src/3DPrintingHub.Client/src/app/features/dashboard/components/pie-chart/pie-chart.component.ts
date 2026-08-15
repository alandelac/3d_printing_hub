import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PieSlice {
  label: string;
  value: number;
  color?: string;
}

interface PieSegment extends PieSlice {
  color: string;
  path: string;
  percent: number;
  labelX: number;
  labelY: number;
}

const DEFAULT_COLORS = [
  '#ff7a59',
  '#8b5cf6',
  '#22c55e',
  '#eab308',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#a855f7',
  '#06b6d4',
  '#84cc16',
  '#ef4444'
];

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChart {
  readonly data = input<PieSlice[]>([]);
  readonly size = input(300);
  readonly unit = input('');

  protected readonly segments = computed<PieSegment[]>(() => {
    const data = this.data();
    const size = this.size();
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    const radius = size / 2 - 12;
    const cx = size / 2;
    const cy = size / 2;
    let angle = -Math.PI / 2; // start at the top (12 o'clock)

    return data.map((slice, i) => {
      const color = slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      if (total <= 0) {
        return { ...slice, color, path: '', percent: 0, labelX: cx, labelY: cy };
      }

      const sweep = (slice.value / total) * Math.PI * 2;
      const endAngle = angle + sweep;
      const largeArc = sweep > Math.PI ? 1 : 0;

      const x1 = cx + radius * Math.cos(angle);
      const y1 = cy + radius * Math.sin(angle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const midAngle = angle + sweep / 2;
      const labelRadius = radius * 0.6;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);

      const percent = (slice.value / total) * 100;
      angle = endAngle;

      return { ...slice, color, path, percent, labelX, labelY };
    });
  });

  protected readonly total = computed(() =>
    this.data().reduce((sum, d) => sum + (d.value || 0), 0)
  );

  protected readonly hasData = computed(() => this.segments().length > 0 && this.total() > 0);
}
