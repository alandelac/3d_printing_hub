import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { ModelPrintCategory } from '../../../domain/models/model-print-category.model';
import { ModelPrint, ModelPrintCreate, ModelPrintUpdate } from '../../../domain/models/model-print.model';

@Component({
  selector: 'app-models-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './models-page.component.html',
  styleUrls: ['./models-page.component.css']
})
export class ModelsPageComponent implements OnInit {
  private modelRepository = inject(ModelRepository);
  protected readonly title = signal('Models');

  // Category functionality
  protected categoryOpen = signal(false);
  protected categories = signal<ModelPrintCategory[]>([]);
  protected categoryLoading = signal(false);
  protected categoryNameInput = signal('');

  // Model creation functionality
  protected modelOpen = signal(false);
  protected modelLoading = signal(false);
  protected modelForm = signal<ModelPrintCreate>({
    name: '',
    categoryId: '',
    estimatedWeightGrams: 0,
    estimatedTimeMinutes: 0
  });

  // Models list functionality
  protected models = signal<ModelPrint[]>([]);
  protected modelsLoading = signal(false);

  // Sorting state
  protected sortColumn = signal<string>('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  // Filter state
  protected modelFilter = signal('');

  // Combined filter + sort
  protected filteredSortedModels = computed(() => {
    const data = this.models();
    const filterText = this.modelFilter().toLowerCase().trim();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    // Step 1: filter
    const filtered = !filterText
      ? data
      : data.filter(m =>
          m.name.toLowerCase().includes(filterText) ||
          m.categoryName.toLowerCase().includes(filterText) ||
          String(m.estimatedWeightGrams).includes(filterText) ||
          String(m.estimatedTimeMinutes).includes(filterText) ||
          String(m.defaultCost).includes(filterText) ||
          String(m.defaultSalePrice).includes(filterText)
        );

    // Step 2: sort
    if (!column) return filtered;

    return [...filtered].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (column) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'category':
          valA = a.categoryName.toLowerCase();
          valB = b.categoryName.toLowerCase();
          break;
        case 'weight':
          valA = a.estimatedWeightGrams;
          valB = b.estimatedWeightGrams;
          break;
        case 'time':
          valA = a.estimatedTimeMinutes;
          valB = b.estimatedTimeMinutes;
          break;
        case 'defaultCost':
          valA = a.defaultCost;
          valB = b.defaultCost;
          break;
        case 'salePrice':
          valA = a.defaultSalePrice;
          valB = b.defaultSalePrice;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return direction === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  });

  protected toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  protected sortIndicator(column: string): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? ' ▲' : ' ▼';
  }

  // Edit Model modal state
  protected editOpen = signal(false);
  protected editLoading = signal(false);
  protected editModelId = signal('');
  protected editName = signal('');
  protected editCategoryId = signal('');
  protected editEstimatedWeightGrams = signal<number | null>(null);
  protected editEstimatedTimeMinutes = signal<number | null>(null);
  protected editFileLocationOrUrl = signal('');
  protected editNotes = signal('');

  // Delete Model confirmation state
  protected deleteOpen = signal(false);
  protected deleteLoading = signal(false);
  protected deleteModelId = signal('');
  protected deleteModelName = signal('');

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadCategories(),
      this.loadModels()
    ]);
  }

  protected async loadCategories(): Promise<void> {
    this.categoryLoading.set(true);
    try {
      const categories = await firstValueFrom(this.modelRepository.getCategories());
      this.categories.set(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert(`Error: ${error}`);
    } finally {
      this.categoryLoading.set(false);
    }
  }

  protected async loadModels(): Promise<void> {
    this.modelsLoading.set(true);
    try {
      const models = await firstValueFrom(this.modelRepository.getAllModelPrints());
      this.models.set(models);
    } catch (error) {
      console.error('Error loading models:', error);
      alert(`Error: ${error}`);
    } finally {
      this.modelsLoading.set(false);
    }
  }

  protected toggleCategoryOpen(): void {
    this.categoryOpen.set(!this.categoryOpen());
    if (!this.categoryOpen()) {
      this.categoryNameInput.set('');
    }
  }

  protected async addCategory(): Promise<void> {
    const name = this.categoryNameInput().trim();
    if (!name) {
      return;
    }

    this.categoryLoading.set(true);
    try {
      await firstValueFrom(this.modelRepository.createCategory({ name }));
      this.categoryNameInput.set('');
      await this.loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert(`Error: ${error}`);
    } finally {
      this.categoryLoading.set(false);
    }
  }

  protected toggleModelOpen(): void {
    this.modelOpen.set(!this.modelOpen());
    if (!this.modelOpen()) {
      this.resetModelForm();
    }
  }

  protected async createModel(): Promise<void> {
    const form = this.modelForm();
    const errors: string[] = [];

    // Validaciones detalladas
    if (!form.name.trim()) {
      errors.push('Name is required');
    }
    if (!form.categoryId) {
      errors.push('Category is required');
    }
    if (form.estimatedWeightGrams <= 0) {
      errors.push('Weight must be greater than 0');
    }
    if (form.estimatedTimeMinutes <= 0) {
      errors.push('Time must be greater than 0');
    }

    // Si hay errores, los imprimimos detalladamente en consola
    if (errors.length > 0) {
      console.warn('❌ Form Validation Failed:', errors);
      console.table(errors.map(err => ({ error: err }))); // Esto crea una tablita en la consola
      
      // Opcional: Si quieres que el alert también sea útil:
      alert(`Validation Error:\n- ${errors.join('\n- ')}`);
      return;
    }

    this.modelLoading.set(true);
    try {
      await firstValueFrom(this.modelRepository.createModelPrint(form));
      this.resetModelForm();
      this.modelOpen.set(false);
      await this.loadModels();
      alert('Model created successfully!');
    } catch (error) {
      console.error('Error creating model:', error);
      alert(`Error: ${error}`);
    } finally {
      this.modelLoading.set(false);
    }
  }

  protected onCategoryChange(categoryId: string): void {
    this.modelForm.update(form => ({
      ...form,
      categoryId
    }));
  }

  protected onModelInputChange(field: keyof ModelPrintCreate, value: string | number): void {
    this.modelForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  private resetModelForm(): void {
    this.modelForm.set({
      name: '',
      categoryId: this.categories().length > 0 ? this.categories()[0].id : '',
      estimatedWeightGrams: 0,
      estimatedTimeMinutes: 0,
      fileLocationOrUrl: '',
      notes: ''
    });
  }

  protected openEditModal(model: ModelPrint): void {
    this.editModelId.set(model.id);
    this.editName.set(model.name);
    this.editCategoryId.set(model.categoryId);
    this.editEstimatedWeightGrams.set(model.estimatedWeightGrams);
    this.editEstimatedTimeMinutes.set(model.estimatedTimeMinutes);
    this.editFileLocationOrUrl.set(model.fileLocationOrUrl ?? '');
    this.editNotes.set(model.notes ?? '');
    this.editOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editOpen.set(false);
    this.resetEditForm();
  }

  protected async updateModel(): Promise<void> {
    const payload: ModelPrintUpdate = {
      id: this.editModelId(),
      name: this.editName() || undefined,
      categoryId: this.editCategoryId() || undefined,
      estimatedWeightGrams: this.editEstimatedWeightGrams() ?? undefined,
      estimatedTimeMinutes: this.editEstimatedTimeMinutes() ?? undefined,
      fileLocationOrUrl: this.editFileLocationOrUrl() || undefined,
      notes: this.editNotes() || undefined,
    };

    this.editLoading.set(true);
    try {
      await firstValueFrom(this.modelRepository.updateModelPrint(payload));
      await this.loadModels();
      this.closeEditModal();
      alert('Model updated successfully!');
    } catch (error) {
      console.error('Error updating model:', error);
      alert(`Error: ${error}`);
    } finally {
      this.editLoading.set(false);
    }
  }

  private resetEditForm(): void {
    this.editModelId.set('');
    this.editName.set('');
    this.editCategoryId.set('');
    this.editEstimatedWeightGrams.set(null);
    this.editEstimatedTimeMinutes.set(null);
    this.editFileLocationOrUrl.set('');
    this.editNotes.set('');
  }

  protected openDeleteModal(model: ModelPrint): void {
    this.deleteModelId.set(model.id);
    this.deleteModelName.set(model.name);
    this.deleteOpen.set(true);
  }

  protected closeDeleteModal(): void {
    this.deleteOpen.set(false);
    this.deleteModelId.set('');
    this.deleteModelName.set('');
  }

  protected async confirmDelete(): Promise<void> {
    this.deleteLoading.set(true);
    try {
      await firstValueFrom(this.modelRepository.deleteModelPrint(this.deleteModelId()));
      await this.loadModels();
      this.closeDeleteModal();
      alert('Model deleted successfully!');
    } catch (error) {
      console.error('Error deleting model:', error);
      alert(`Error: ${error}`);
    } finally {
      this.deleteLoading.set(false);
    }
  }
}
