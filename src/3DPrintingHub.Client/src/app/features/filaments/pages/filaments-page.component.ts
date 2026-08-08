import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentColor } from '../../../domain/models/filament-color.model';
import { FilamentBrand } from '../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../domain/models/filament-material-type.model';

@Component({
  selector: 'app-filaments-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filaments-page.component.html',
  styleUrls: ['./filaments-page.component.css']
})
export class FilamentsPageComponent implements OnInit {
  private filamentRepository = inject(FilamentRepository);
  protected readonly title = signal('Filaments');
  protected open = signal(false);
  protected colors = signal<FilamentColor[]>([]);
  protected loading = signal(false);
  protected nameInput = signal('');
  protected codeInput = signal('#FFFFFF');

  // Brand functionality
  protected brandOpen = signal(false);
  protected brands = signal<FilamentBrand[]>([]);
  protected brandLoading = signal(false);
  protected brandNameInput = signal('');

  // MaterialType functionality
  protected materialTypeOpen = signal(false);
  protected materialTypes = signal<FilamentMaterialType[]>([]);
  protected materialTypeLoading = signal(false);
  protected materialNameInput = signal('');

  ngOnInit(): void {
    void this.loadColors();
    // Also load brands
    void this.loadBrands();
    // Also load material types
    void this.loadMaterialTypes();
  }

  protected toggleOpen(): void {
    this.open.set(!this.open());
  }

  protected closeModal(): void {
    this.open.set(false);
  }

  protected async loadColors(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.filamentRepository.getColors());
      this.colors.set(data ?? []);
    } catch (error) {
      console.error(error);
      this.colors.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected async addColor(): Promise<void> {
    await firstValueFrom(this.filamentRepository.createColor({ color: this.nameInput(), colorCode: this.codeInput() }));
    await this.loadColors();
    this.nameInput.set('');
    this.codeInput.set('#FFFFFF');
  }

  // Brand methods
  protected toggleBrandOpen(): void {
    this.brandOpen.set(!this.brandOpen());
    if (!this.brandOpen()) {
      this.brandNameInput.set('');
    }
  }

  protected closeBrandModal(): void {
    this.brandOpen.set(false);
  }

  protected async loadBrands(): Promise<void> {
    this.brandLoading.set(true);
    try {
      const data = await firstValueFrom(this.filamentRepository.getBrands());
      this.brands.set(data ?? []);
    } catch (error) {
      console.error(error);
      this.brands.set([]);
    } finally {
      this.brandLoading.set(false);
    }
  }

  protected async addBrand(): Promise<void> {
    await firstValueFrom(this.filamentRepository.createBrand({ name: this.brandNameInput() }));
    await this.loadBrands();
    this.brandNameInput.set('');
  }

  // MaterialType methods
  protected toggleMaterialTypeOpen(): void {
    this.materialTypeOpen.set(!this.materialTypeOpen());
    if (!this.materialTypeOpen()) {
      this.materialNameInput.set('');
    }
  }

  protected closeMaterialTypeModal(): void {
    this.materialTypeOpen.set(false);
  }

  protected async loadMaterialTypes(): Promise<void> {
    this.materialTypeLoading.set(true);
    try {
      const data = await firstValueFrom(this.filamentRepository.getMaterialTypes());
      this.materialTypes.set(data ?? []);
    } catch (error) {
      console.error(error);
      this.materialTypes.set([]);
    } finally {
      this.materialTypeLoading.set(false);
    }
  }

  protected async addMaterialType(): Promise<void> {
    await firstValueFrom(this.filamentRepository.createMaterialType({ name: this.materialNameInput() }));
    await this.loadMaterialTypes();
    this.materialNameInput.set('');
  }
}
