import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { PrintJobRepository } from '../../../data/repositories/print-job.repository';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { PrintJob, PrintJobCreate } from '../../../domain/models/print-job.model';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import { PrintJobFormComponent, PrintJobFormValue } from '../components/print-job-form.component';

@Component({
  selector: 'app-print-jobs-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, DateFormatPipe, PrintJobFormComponent],
  templateUrl: './print-jobs-page.component.html',
})
export class PrintJobsPageComponent implements OnInit {
  private readonly printJobRepository = inject(PrintJobRepository);
  private readonly modelRepository = inject(ModelRepository);
  private readonly filamentRepository = inject(FilamentRepository);

  protected readonly title = signal('Print Jobs');
  protected readonly printJobs = signal<PrintJob[]>([]);
  protected readonly models = signal<ModelPrint[]>([]);
  protected readonly filaments = signal<Filament[]>([]);
  protected readonly loading = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly validationError = signal<string | null>(null);

  protected readonly columns: TableColumn<PrintJob>[] = [
    { key: 'modelPrintName', header: 'Model', value: job => job.modelPrintName ?? 'Unknown model' },
    { key: 'filamentName', header: 'Filament', value: job => job.filamentName ?? 'Unknown filament' },
    { key: 'producedQuantity', header: 'Produced', value: job => job.producedQuantity },
    { key: 'usedWeightGrams', header: 'Used (g)', value: job => job.usedWeightGrams },
    { key: 'calculatedMaterialCost', header: 'Material cost', value: job => job.calculatedMaterialCost },
    { key: 'printedAt', header: 'Printed', value: job => job.printedAt },
  ];

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadModels(),
      this.loadFilaments(),
      this.loadPrintJobs()
    ]);
  }

  protected openCreateForm(): void {
    this.validationError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.validationError.set(null);
  }

  protected async savePrintJob(value: PrintJobFormValue): Promise<void> {
    if (!value.modelPrintId) {
      this.validationError.set('Please select a model.');
      return;
    }

    if (!value.filamentId) {
      this.validationError.set('Please select a filament.');
      return;
    }

    if (!Number.isFinite(value.producedQuantity) || value.producedQuantity <= 0) {
      this.validationError.set('Produced quantity must be greater than zero.');
      return;
    }

    if (!Number.isFinite(value.usedWeightGrams) || value.usedWeightGrams <= 0) {
      this.validationError.set('Used weight must be greater than zero.');
      return;
    }

    const payload: PrintJobCreate = {
      modelPrintId: value.modelPrintId,
      filamentId: value.filamentId,
      producedQuantity: value.producedQuantity,
      usedWeightGrams: value.usedWeightGrams,
      notes: value.notes || undefined,
      printedAt: new Date().toISOString(),
    };

    this.loading.set(true);
    this.validationError.set(null);

    try {
      await firstValueFrom(this.printJobRepository.createPrintJob(payload));
      this.closeForm();
      await this.loadPrintJobs();
    } catch (error) {
      console.error('Error creating print job:', error);
      this.validationError.set(`Error: ${error}`);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPrintJobs(): Promise<void> {
    try {
      const printJobs = await firstValueFrom(this.printJobRepository.getPrintJobs());
      this.printJobs.set(printJobs);
    } catch (error) {
      console.error('Error loading print jobs:', error);
      this.validationError.set(`Error: ${error}`);
    }
  }

  private async loadModels(): Promise<void> {
    try {
      this.models.set(await firstValueFrom(this.modelRepository.getAllModelPrints()));
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  private async loadFilaments(): Promise<void> {
    try {
      this.filaments.set(await firstValueFrom(this.filamentRepository.getFilaments()));
    } catch (error) {
      console.error('Error loading filaments:', error);
    }
  }
}
