import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { Filament } from '../../../domain/models/filament.model';
import { ModelPrint } from '../../../domain/models/model-print.model';
import { PieChart, PieSlice } from '../components/pie-chart/pie-chart.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, PieChart],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  private filamentRepository = inject(FilamentRepository);
  private modelRepository = inject(ModelRepository);

  protected readonly title = signal('Dashboard');
  protected loading = signal(false);
  protected error = signal('');

  // ---- Filament dashboard data ----
  protected filaments = signal<Filament[]>([]);

  // Total kg of filament in inventory.
  protected readonly totalKg = computed(() =>
    this.filaments().reduce((sum, f) => sum + (f.remainingWeightGrams || 0), 0) / 1000
  );

  // Distribution of filament by material type (each slice = a % of the total kg).
  protected readonly typeSlices = computed<PieSlice[]>(() => {
    const byType = new Map<string, number>();

    for (const filament of this.filaments()) {
      const name = filament.filamentProfile?.materialTypeName ?? 'Unknown';
      const grams = filament.remainingWeightGrams || 0;
      byType.set(name, (byType.get(name) ?? 0) + grams / 1000);
    }

    return Array.from(byType.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  });

  // ---- Models dashboard data ----
  protected models = signal<ModelPrint[]>([]);

  // Total number of models.
  protected readonly totalModels = computed(() => this.models().length);

  // Distribution of models by print category (each slice = a % of total models).
  protected readonly categorySlices = computed<PieSlice[]>(() => {
    const byCategory = new Map<string, number>();

    for (const model of this.models()) {
      const name = model.categoryName || 'Unknown';
      byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
    }

    return Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  });

  ngOnInit(): void {
    void this.loadDashboard();
  }

  protected async loadDashboard(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [filaments, models] = await Promise.all([
        firstValueFrom(this.filamentRepository.getFilaments()),
        firstValueFrom(this.modelRepository.getAllModelPrints())
      ]);
      this.filaments.set(filaments ?? []);
      this.models.set(models ?? []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error.set(String(error));
    } finally {
      this.loading.set(false);
    }
  }
}

