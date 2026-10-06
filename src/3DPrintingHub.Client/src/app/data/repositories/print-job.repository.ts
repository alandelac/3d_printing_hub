import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../core/http/api-client';
import { PrintJob, PrintJobCreate } from '../../domain/models/print-job.model';

@Injectable({ providedIn: 'root' })
export class PrintJobRepository {
  private readonly api = inject(ApiClient);

  getPrintJobs() {
    return this.api.get<PrintJob[]>('/printjobs');
  }

  createPrintJob(payload: PrintJobCreate) {
    return this.api.post<{ id: string }>('/printjobs', payload);
  }
}
