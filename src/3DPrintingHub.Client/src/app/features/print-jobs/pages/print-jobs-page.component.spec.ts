import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { PrintJobRepository } from '../../../data/repositories/print-job.repository';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { PrintJobsPageComponent } from './print-jobs-page.component';

const models: ModelPrint[] = [{
  id: 'm1',
  name: 'Bracket',
  categoryId: 'c1',
  categoryName: 'Functional',
  estimatedWeightGrams: 42,
  estimatedTimeMinutes: 60,
  commercialLicense: false,
  defaultSalePrice: 10,
  defaultCost: 5
}];

const filaments: Filament[] = [{
  id: 'f1',
  filamentProfileId: 'p1',
  filamentProfile: { id: 'p1', brandId: 'b1', brandName: 'Prusa', materialTypeId: 't1', materialTypeName: 'PLA' },
  filamentColorId: 'c1',
  colorName: 'Black',
  colorCode: '#000000',
  remainingWeightGrams: 1000,
  minCost: 8,
  maxCost: 16,
  lastCost: 16,
  lastPurchaseDate: '2026-10-01T00:00:00Z'
}];

describe('PrintJobsPageComponent', () => {
  let fixture: ComponentFixture<PrintJobsPageComponent>;
  let getPrintJobs: ReturnType<typeof vi.fn>;
  let createPrintJob: ReturnType<typeof vi.fn>;
  let getAllModelPrints: ReturnType<typeof vi.fn>;
  let getFilaments: ReturnType<typeof vi.fn>;

  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    getPrintJobs = vi.fn().mockReturnValue(of([]));
    createPrintJob = vi.fn().mockReturnValue(of({ id: 'job1' }));
    getAllModelPrints = vi.fn().mockReturnValue(of(models));
    getFilaments = vi.fn().mockReturnValue(of(filaments));

    await TestBed.configureTestingModule({
      imports: [PrintJobsPageComponent],
      providers: [
        { provide: PrintJobRepository, useValue: { getPrintJobs, createPrintJob } },
        { provide: ModelRepository, useValue: { getAllModelPrints } },
        { provide: FilamentRepository, useValue: { getFilaments } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintJobsPageComponent);
    fixture.detectChanges();
    await flush();
  });

  it('creates the job and refreshes jobs and filament inventory', async () => {
    await (fixture.componentInstance as any).savePrintJob({
      modelPrintId: 'm1',
      filamentId: 'f1',
      producedQuantity: 2,
      usedWeightGrams: 84,
      notes: ''
    });
    await flush();

    expect(createPrintJob).toHaveBeenCalledWith(expect.objectContaining({
      modelPrintId: 'm1',
      filamentId: 'f1',
      producedQuantity: 2,
      usedWeightGrams: 84
    }));
    expect(getPrintJobs).toHaveBeenCalledTimes(2);
    expect(getFilaments).toHaveBeenCalledTimes(2);
  });

  it('opens the create form and closes it when cancelled', async () => {
    const addButton = fixture.nativeElement.querySelector('button.primary') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-print-job-form')).not.toBeNull();

    const cancelButton = fixture.nativeElement.querySelector('button.secondary') as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-print-job-form')).toBeNull();
  });

  it('shows insufficient filament errors in the shared modal', async () => {
    createPrintJob.mockReturnValue(throwError(() => ({
      error: { detail: 'Insufficient filament remaining weight to complete the requested print job.' }
    })));

    await (fixture.componentInstance as any).savePrintJob({
      modelPrintId: 'm1',
      filamentId: 'f1',
      producedQuantity: 2,
      usedWeightGrams: 84,
      notes: ''
    });
    await flush();

    expect(fixture.nativeElement.querySelector('app-modal')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('There is not enough filament remaining for this print.');
  });
});