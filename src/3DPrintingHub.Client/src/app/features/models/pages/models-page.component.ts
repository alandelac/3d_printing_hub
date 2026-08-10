import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ModelRepository } from '../../../data/repositories/model.repository';
import { ModelPrintCategory } from '../../../domain/models/model-print-category.model';

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

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
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
}
