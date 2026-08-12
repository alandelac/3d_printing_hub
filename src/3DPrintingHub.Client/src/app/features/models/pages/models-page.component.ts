import { Component, signal, inject, OnInit } from '@angular/core';
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
    
    if (!form.name.trim() || !form.categoryId || form.estimatedWeightGrams <= 0 || form.estimatedTimeMinutes <= 0) {
      alert('Please fill in all required fields with valid values.');
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
