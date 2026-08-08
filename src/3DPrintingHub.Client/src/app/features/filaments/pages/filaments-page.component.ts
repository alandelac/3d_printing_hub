import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentColor } from '../../../domain/models/filament-color.model';
import { FilamentBrand } from '../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate } from '../../../domain/models/filament-profile.model';

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

  // Filament Profile functionality
  protected profileOpen = signal(false);
  protected profiles = signal<FilamentProfile[]>([]);
  protected profileLoading = signal(false);
  protected profileBrandId = signal('');
  protected profileMaterialTypeId = signal('');
  protected profileIroningFlow = signal<number | null>(null);
  protected profileIroningSpeed = signal<number | null>(null);
  protected profileSlopeAngle = signal<number | null>(null);
  protected profileZSeparation = signal<number | null>(null);

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

  // Filament Profile methods
  protected async toggleProfileOpen(): Promise<void> {
    const newState = !this.profileOpen();
    this.profileOpen.set(newState);
    if (newState) {
      console.log('Opening profile modal. Brands:', this.brands().length, 'MaterialTypes:', this.materialTypes().length);
      console.log('Brands:', this.brands());
      console.log('MaterialTypes:', this.materialTypes());
      await this.loadProfiles();
    } else {
      this.resetProfileForm();
    }
  }

  protected closeProfileModal(): void {
    this.profileOpen.set(false);
  }

  protected async loadProfiles(): Promise<void> {
    this.profileLoading.set(true);
    try {
      const data = await firstValueFrom(this.filamentRepository.getFilamentProfiles());
      this.profiles.set(data ?? []);
    } catch (error) {
      console.error(error);
      this.profiles.set([]);
    } finally {
      this.profileLoading.set(false);
    }
  }

  protected async addProfile(): Promise<void> {
    console.log('Adding profile with:', {
      brandId: this.profileBrandId(),
      materialTypeId: this.profileMaterialTypeId(),
      ironingFlowPercentage: this.profileIroningFlow(),
      ironingSpeedMmS: this.profileIroningSpeed(),
      slopeAngleForSupports: this.profileSlopeAngle(),
      zSeparationForSupports: this.profileZSeparation()
    });

    // Validate that brand and material type are selected
    if (!this.profileBrandId() || this.profileBrandId() === '') {
      alert('Please select a brand');
      return;
    }

    if (!this.profileMaterialTypeId() || this.profileMaterialTypeId() === '') {
      alert('Please select a material type');
      return;
    }

    const payload: FilamentProfileCreate = {
      brandId: this.profileBrandId(),
      materialTypeId: this.profileMaterialTypeId(),
      ironingFlowPercentage: this.profileIroningFlow() ?? undefined,
      ironingSpeedMmS: this.profileIroningSpeed() ?? undefined,
      slopeAngleForSupports: this.profileSlopeAngle() ?? undefined,
      zSeparationForSupports: this.profileZSeparation() ?? undefined,
    };

    console.log('Payload being sent:', payload);

    try {
      await firstValueFrom(this.filamentRepository.createFilamentProfile(payload));
      await this.loadProfiles();
      this.resetProfileForm();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(`Error: ${error}`);
    }
  }

  private resetProfileForm(): void {
    this.profileBrandId.set('');
    this.profileMaterialTypeId.set('');
    this.profileIroningFlow.set(null);
    this.profileIroningSpeed.set(null);
    this.profileSlopeAngle.set(null);
    this.profileZSeparation.set(null);
  }
}
