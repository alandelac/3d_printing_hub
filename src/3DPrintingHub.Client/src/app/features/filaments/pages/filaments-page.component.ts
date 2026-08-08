import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentColor } from '../../../domain/models/filament-color.model';
import { FilamentBrand } from '../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate } from '../../../domain/models/filament-profile.model';
import { Filament, FilamentCreate } from '../../../domain/models/filament.model';

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

  // Filament main data (displayed directly on page)
  protected filaments = signal<Filament[]>([]);
  protected filamentLoading = signal(false);
  protected filamentFormOpen = signal(true);

  // Filament form fields
  protected filamentProfileId = signal('');
  protected filamentColorId = signal('');
  protected filamentMinCost = signal<number | null>(null);
  protected filamentMaxCost = signal<number | null>(null);
  protected filamentLastCost = signal<number | null>(null);
  protected filamentBuyAgain = signal(false);
  protected filamentBuyLink = signal('');
  protected filamentLastPurchaseDate = signal('');
  protected filamentRemainingWeight = signal<number | null>(null);

  ngOnInit(): void {
    void this.loadColors();
    void this.loadBrands();
    void this.loadMaterialTypes();
    void this.loadFilaments();
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

  protected async loadFilaments(): Promise<void> {
    this.filamentLoading.set(true);
    try {
      const data = await firstValueFrom(this.filamentRepository.getFilaments());
      this.filaments.set(data ?? []);
    } catch (error) {
      console.error(error);
      this.filaments.set([]);
    } finally {
      this.filamentLoading.set(false);
    }
  }

  protected toggleFilamentForm(): void {
    this.filamentFormOpen.set(!this.filamentFormOpen());
    if (!this.filamentFormOpen()) {
      this.resetFilamentForm();
    }
  }

  protected async addFilament(): Promise<void> {
    if (!this.filamentProfileId() || this.filamentProfileId() === '') {
      alert('Please select a filament profile');
      return;
    }

    if (!this.filamentColorId() || this.filamentColorId() === '') {
      alert('Please select a color');
      return;
    }

    if (this.filamentMinCost() === null || this.filamentMaxCost() === null || this.filamentLastCost() === null) {
      alert('Please fill in all cost fields');
      return;
    }

    const payload: FilamentCreate = {
      filamentProfileId: this.filamentProfileId(),
      filamentColorId: this.filamentColorId(),
      minCost: this.filamentMinCost()!,
      maxCost: this.filamentMaxCost()!,
      lastCost: this.filamentLastCost()!,
      buyAgain: this.filamentBuyAgain(),
      buyLink: this.filamentBuyLink() || undefined,
      lastPurchaseDate: this.filamentLastPurchaseDate() || undefined,
      remainingWeightGrams: this.filamentRemainingWeight() ?? undefined,
    };

    try {
      await firstValueFrom(this.filamentRepository.createFilament(payload));
      await this.loadFilaments();
      this.resetFilamentForm();
    } catch (error) {
      console.error('Error creating filament:', error);
      alert(`Error: ${error}`);
    }
  }

  private resetFilamentForm(): void {
    this.filamentProfileId.set('');
    this.filamentColorId.set('');
    this.filamentMinCost.set(null);
    this.filamentMaxCost.set(null);
    this.filamentLastCost.set(null);
    this.filamentBuyAgain.set(false);
    this.filamentBuyLink.set('');
    this.filamentLastPurchaseDate.set('');
    this.filamentRemainingWeight.set(null);
  }
}
