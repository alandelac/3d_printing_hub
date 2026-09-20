import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { ModelPrintCategory } from '../../../domain/models/model-print-category.model';
import { ModelPrint, ModelPrintCreate, ModelPrintUpdate } from '../../../domain/models/model-print.model';
import { ConfirmDeleteComponent } from '../../../shared/ui/confirm-delete/confirm-delete.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableHeaderDirective
} from '../../../shared/ui/table/table.component';
import { CategoryFormValue, CategoryModalComponent } from '../components/category-modal/category-modal.component';
import { ModelFormModalComponent, ModelFormValue } from '../components/model-form-modal/model-form-modal.component';

@Component({
  selector: 'app-models-page',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    TableCellDirective,
    TableHeaderDirective,
    ConfirmDeleteComponent,
    CategoryModalComponent,
    ModelFormModalComponent
  ],
  templateUrl: './models-page.component.html',
  styleUrls: ['./models-page.component.css']
})
export class ModelsPageComponent implements OnInit {
  private modelRepository = inject(ModelRepository);
  protected readonly title = signal('Models');

  protected readonly columns: TableColumn<ModelPrint>[] = [
    { key: 'name', header: 'Name', value: model => model.name },
    { key: 'category', header: 'Category', value: model => model.categoryName },
    { key: 'weight', header: 'Weight (g)', value: model => model.estimatedWeightGrams },
    { key: 'time', header: 'Time (min)', value: model => model.estimatedTimeMinutes },
    { key: 'defaultCost', header: 'Default Cost' },
    { key: 'defaultSalePrice', header: 'Sale Price' }
  ];

  // Category functionality
  protected categoryOpen = signal(false);
  protected categories = signal<ModelPrintCategory[]>([]);
  protected categoryLoading = signal(false);

  // Model creation functionality
  protected modelOpen = signal(false);
  protected modelLoading = signal(false);

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
  protected editModel = signal<ModelPrint | null>(null);

  // Generic delete confirmation state (shared by model and category tables)
  protected deleteOpen = signal(false);
  protected deleteLoading = signal(false);
  protected deleteName = signal('');
  private pendingDelete: (() => Promise<void>) | null = null;

  protected openDeleteConfirm(name: string, action: () => Promise<void>): void {
    this.deleteName.set(name);
    this.pendingDelete = action;
    this.deleteOpen.set(true);
  }

  protected closeDeleteModal(): void {
    this.deleteOpen.set(false);
    this.deleteName.set('');
    this.pendingDelete = null;
  }

  protected async confirmDelete(): Promise<void> {
    const action = this.pendingDelete;
    this.pendingDelete = null;
    if (!action) {
      this.closeDeleteModal();
      return;
    }
    this.deleteLoading.set(true);
    try {
      await action();
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(`Error: ${error}`);
    } finally {
      this.deleteLoading.set(false);
    }
  }

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
  }

  protected async saveCategory(value: CategoryFormValue): Promise<void> {
    const name = value.name.trim();
    if (!name) {
      return;
    }

    this.categoryLoading.set(true);
    try {
      if (value.id) {
        await firstValueFrom(this.modelRepository.updateCategory({ id: value.id, name }));
      } else {
        await firstValueFrom(this.modelRepository.createCategory({ name }));
      }
      await this.loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Error: ${error}`);
    } finally {
      this.categoryLoading.set(false);
    }
  }

  protected deleteCategoryConfirm(category: ModelPrintCategory): void {
    this.openDeleteConfirm(category.name, async () => {
      await firstValueFrom(this.modelRepository.deleteCategory(category.id));
      await this.loadCategories();
    });
  }

  protected toggleModelOpen(): void {
    this.modelOpen.set(!this.modelOpen());
  }

  protected async createModel(form: ModelFormValue): Promise<void> {
    const errors: string[] = [];

    // Validaciones detalladas
    if (!form.name.trim()) {
      errors.push('Name is required');
    }
    if (!form.categoryId) {
      errors.push('Category is required');
    }
    if ((form.estimatedWeightGrams ?? 0) <= 0) {
      errors.push('Weight must be greater than 0');
    }
    if ((form.estimatedTimeMinutes ?? 0) <= 0) {
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

    const payload: ModelPrintCreate = {
      name: form.name,
      categoryId: form.categoryId,
      estimatedWeightGrams: form.estimatedWeightGrams ?? 0,
      estimatedTimeMinutes: form.estimatedTimeMinutes ?? 0,
      fileLocationOrUrl: form.fileLocationOrUrl,
      notes: form.notes
    };

    this.modelLoading.set(true);
    try {
      await firstValueFrom(this.modelRepository.createModelPrint(payload));
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

  protected openEditModal(model: ModelPrint): void {
    this.editModel.set(model);
    this.editOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editOpen.set(false);
    this.editModel.set(null);
  }

  protected async updateModel(form: ModelFormValue): Promise<void> {
    const current = this.editModel();
    if (!current) {
      return;
    }

    const payload: ModelPrintUpdate = {
      id: current.id,
      name: form.name || undefined,
      categoryId: form.categoryId || undefined,
      estimatedWeightGrams: form.estimatedWeightGrams ?? undefined,
      estimatedTimeMinutes: form.estimatedTimeMinutes ?? undefined,
      fileLocationOrUrl: form.fileLocationOrUrl || undefined,
      notes: form.notes || undefined
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

  protected openDeleteModal(model: ModelPrint): void {
    this.openDeleteConfirm(model.name, async () => {
      await firstValueFrom(this.modelRepository.deleteModelPrint(model.id));
      await this.loadModels();
    });
  }
}
