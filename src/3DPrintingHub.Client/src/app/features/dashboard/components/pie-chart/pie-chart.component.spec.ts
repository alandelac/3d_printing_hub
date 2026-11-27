import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieChart } from './pie-chart.component';

describe('PieChart', () => {
  let fixture: ComponentFixture<PieChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieChart]
    }).compileComponents();

    fixture = TestBed.createComponent(PieChart);
    fixture.componentRef.setInput('data', [{ label: 'PLA', value: 1 }]);
    fixture.detectChanges();
  });

  it('renders a full circle and 100% label for a single slice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const path = compiled.querySelector('.pie-slice')?.getAttribute('d') ?? '';

    expect(path.match(/ A /g)).toHaveLength(2);
    expect(compiled.querySelector('.slice-label')?.textContent?.trim()).toBe('100.0%');
  });

  it('shows the empty-state message instead of the chart when there is no data', () => {
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('emptyText', 'No model available');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('svg')).toBeNull();
    expect(compiled.querySelector('.pie-empty-state')?.textContent?.trim()).toBe('No model available');
  });
});
