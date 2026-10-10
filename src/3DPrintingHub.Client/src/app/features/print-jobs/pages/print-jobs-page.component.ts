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
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import { PrintJobFormComponent, PrintJobFormValue } from '../components/print-job-form.component';

@Component({
  selector: 'app-print-jobs-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, DateFormatPipe, ModalComponent, PrintJobFormComponent],
  templateUrl: './print-jobs-page.component.html',
  styles: [`
    .print-jobs-page { padding: 1rem; }
    .swatch { display: inline-block; width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; border-radius: 3px; border: 1px solid rgba(0,0,0,0.06); }
  `],
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
    { key: 'filamentName', header: 'Filament', value: job => this.filamentLabel(job) },
    { key: 'producedQuantity', header: 'Produced', value: job => job.producedQuantity },
    { key: 'usedWeightGrams', header: 'Used (g)', value: job => job.usedWeightGrams },
    { key: 'calculatedMaterialCost', header: 'Material cost', value: job => job.calculatedMaterialCost },
    { key: 'printedAt', header: 'Printed', value: job => job.printedAt },
  ];

  protected filamentLabel(job: PrintJob): string {
    const color = job.filamentName?.trim();
    const brand = job.filamentBrandName?.trim();
    const material = job.filamentMaterialTypeName?.trim();

    if (!color && !brand && !material) {
      return 'Unknown filament';
    }

    const brandMaterial = [brand, material].filter(Boolean).join(' ');
    if (!color) {
      return brandMaterial;
    }

    return brandMaterial ? `${color} - ${brandMaterial}` : color;
  }

  protected filamentSwatch(job: PrintJob): string | null {
    return job.filamentColorCode?.trim() ? job.filamentColorCode : null;
  }

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

  protected dismissError(): void {
    this.validationError.set(null);
  }

  protected async savePrintJob(value: PrintJobFormValue): Promise<void> {
    if (!value.modelPrintId) {
      this.validationError.set('Select a model before saving the print job.');
      return;
    }

    if (!value.filamentId) {
      this.validationError.set('Select a filament before saving the print job.');
      return;
    }

    if (!Number.isFinite(value.producedQuantity) || value.producedQuantity <= 0) {
      this.validationError.set('Enter a quantity of at least one item.');
      return;
    }

    if (!Number.isFinite(value.usedWeightGrams) || value.usedWeightGrams <= 0) {
      this.validationError.set('The selected model needs a valid estimated weight before it can be printed.');
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
      await Promise.all([this.loadPrintJobs(), this.loadFilaments()]);
    } catch (error) {
      console.error('Error creating print job:', error);
      this.validationError.set(this.getFriendlyErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  protected async loadPrintJobs(): Promise<void> {
    try {
      const printJobs = await firstValueFrom(this.printJobRepository.getPrintJobs());
      this.printJobs.set(printJobs);
    } catch (error) {
      console.error('Error loading print jobs:', error);
      this.validationError.set(this.getFriendlyErrorMessage(error));
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

  private getFriendlyErrorMessage(error: unknown): string {
    const response = error && typeof error === 'object'
      ? (error as { error?: unknown }).error
      : null;
    const problem = response && typeof response === 'object'
      ? response as Record<string, unknown>
      : null;
    const message = [problem?.['detail'], problem?.['message'], problem?.['title']]
      .find(value => typeof value === 'string' && value.trim().length > 0) as string | undefined;
    const normalizedMessage = message?.toLowerCase() ?? '';

    if (normalizedMessage.includes('insufficient filament')) {
      return 'There is not enough filament remaining for this print. Choose another filament or reduce the quantity.';
    }

    if (normalizedMessage.includes('no product stock row')) {
      return 'There is no stock entry for this model and filament combination. Add it to product stock before recording this print.';
    }

    return message ?? 'We could not save this print job. Check the selected model and filament, then try again.';
  }
}
