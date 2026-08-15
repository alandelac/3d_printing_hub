import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentColor } from '../../../domain/models/filament-color.model';
import { FilamentBrand } from '../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate, FilamentProfileUpdate } from '../../../domain/models/filament-profile.model';
import { Filament, FilamentCreate, FilamentUpdate, AdjustFilamentWeight } from '../../../domain/models/filament.model';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../shared/ui/list-state/list-state.component';
import { ColorsModalComponent } from '../components/colors-modal/colors-modal.component';
import { BrandsModalComponent } from '../components/brands-modal/brands-modal.component';
import { MaterialTypesModalComponent } from '../components/material-types-modal/material-types-modal.component';

@Component({
  selector: 'app-filaments-page',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent, ColorsModalComponent, BrandsModalComponent, MaterialTypesModalComponent],
  templateUrl: './filaments-page.component.html',
  styleUrls: ['./filaments-page.component.css']
})
export class FilamentsPageComponent implements OnInit {
  private filamentRepository = inject(FilamentRepository);
  protected readonly title = signal('Filaments');
  protected open = signal(false);
  protected colors = signal<FilamentColor[]>([]);
  protected loading = signal(false);

  // Brand functionality
  protected brandOpen = signal(false);
  protected brands = signal<FilamentBrand[]>([]);
  protected brandLoading = signal(false);

  // MaterialType functionality
  protected materialTypeOpen = signal(false);
  protected materialTypes = signal<FilamentMaterialType[]>([]);
  protected materialTypeLoading = signal(false);

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
  protected editingProfileId = signal('');

  protected isEditingProfile(): boolean {
    return this.editingProfileId() !== '';
  }

  protected startEditProfile(profile: FilamentProfile): void {
    this.editingProfileId.set(profile.id);
    this.profileBrandId.set(profile.brandId);
    this.profileMaterialTypeId.set(profile.materialTypeId);
    this.profileIroningFlow.set(profile.ironingFlowPercentage ?? null);
    this.profileIroningSpeed.set(profile.ironingSpeedMmS ?? null);
    this.profileSlopeAngle.set(profile.slopeAngleForSupports ?? null);
    this.profileZSeparation.set(profile.zSeparationForSupports ?? null);
  }

  protected cancelEditProfile(): void {
    this.editingProfileId.set('');
    this.resetProfileForm();
  }

  // Filament main data (displayed directly on page)
  protected filaments = signal<Filament[]>([]);
  protected filamentLoading = signal(false);

  // Sorting state
  protected sortColumn = signal<string>('');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  // Filter state
  protected filamentFilter = signal('');

  // Combined filter + sort
  protected filteredSortedFilaments = computed(() => {
    const data = this.filaments();
    const filterText = this.filamentFilter().toLowerCase().trim();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    // Step 1: filter
    const filtered = !filterText
      ? data
      : data.filter(f =>
          `${f.filamentProfile.brandName} ${f.filamentProfile.materialTypeName}`.toLowerCase().includes(filterText) ||
          f.colorName.toLowerCase().includes(filterText) ||
          String(f.remainingWeightGrams).includes(filterText) ||
          String(f.minCost).includes(filterText) ||
          String(f.maxCost).includes(filterText) ||
          String(f.lastCost).includes(filterText) ||
          (f.lastPurchaseDate || '').toLowerCase().includes(filterText) ||
          (f.buyAgain ? 'yes' : 'no').includes(filterText) ||
          (f.buyLink || '').toLowerCase().includes(filterText)
        );

    // Step 2: sort
    if (!column) return filtered;

    return [...filtered].sort((a, b) => {
      let valA: string | number | boolean;
      let valB: string | number | boolean;

      switch (column) {
        case 'profile':
          valA = `${a.filamentProfile.brandName} ${a.filamentProfile.materialTypeName}`.toLowerCase();
          valB = `${b.filamentProfile.brandName} ${b.filamentProfile.materialTypeName}`.toLowerCase();
          break;
        case 'color':
          valA = a.colorName.toLowerCase();
          valB = b.colorName.toLowerCase();
          break;
        case 'remainingWeight':
          valA = a.remainingWeightGrams;
          valB = b.remainingWeightGrams;
          break;
        case 'minCost':
          valA = a.minCost;
          valB = b.minCost;
          break;
        case 'maxCost':
          valA = a.maxCost;
          valB = b.maxCost;
          break;
        case 'lastCost':
          valA = a.lastCost;
          valB = b.lastCost;
          break;
        case 'lastPurchaseDate':
          valA = a.lastPurchaseDate || '';
          valB = b.lastPurchaseDate || '';
          break;
        case 'buyAgain':
          valA = a.buyAgain ?? false;
          valB = b.buyAgain ?? false;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return direction === 'asc'
          ? (valA === valB ? 0 : valA ? 1 : -1)
          : (valA === valB ? 0 : valA ? -1 : 1);
      }

      return 0;
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
  protected filamentFormOpen = signal(false);

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

  // Edit Filament modal state
  protected editOpen = signal(false);
  protected editLoading = signal(false);
  protected editFilamentId = signal('');
  protected editMinCost = signal<number | null>(null);
  protected editMaxCost = signal<number | null>(null);
  protected editLastCost = signal<number | null>(null);
  protected editBuyAgain = signal(false);
  protected editBuyLink = signal('');
  protected editLastPurchaseDate = signal('');
  protected editRemainingWeight = signal<number | null>(null);

  // Delete Filament confirmation state
  protected deleteOpen = signal(false);
  protected deleteLoading = signal(false);
  protected deleteFilamentId = signal('');
  protected deleteFilamentName = signal('');

  // Adjust Weight modal state
  protected adjustWeightOpen = signal(false);
  protected adjustWeightLoading = signal(false);
  protected adjustWeightFilamentId = signal('');
  protected adjustWeightGrams = signal<number | null>(null);

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

  protected async createColor(payload: { color: string; colorCode: string }): Promise<void> {
    await firstValueFrom(this.filamentRepository.createColor(payload));
    await this.loadColors();
  }

  // Brand methods
  protected toggleBrandOpen(): void {
    this.brandOpen.set(!this.brandOpen());
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

  protected async createBrand(payload: { name: string }): Promise<void> {
    await firstValueFrom(this.filamentRepository.createBrand(payload));
    await this.loadBrands();
  }

  // MaterialType methods
  protected toggleMaterialTypeOpen(): void {
    this.materialTypeOpen.set(!this.materialTypeOpen());
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

  protected async createMaterialType(payload: { name: string }): Promise<void> {
    await firstValueFrom(this.filamentRepository.createMaterialType(payload));
    await this.loadMaterialTypes();
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

  protected async updateProfile(): Promise<void> {
    const id = this.editingProfileId();
    if (!id) {
      return;
    }

    if (!this.profileBrandId() || this.profileBrandId() === '') {
      alert('Please select a brand');
      return;
    }

    if (!this.profileMaterialTypeId() || this.profileMaterialTypeId() === '') {
      alert('Please select a material type');
      return;
    }

    const payload: FilamentProfileUpdate = {
      id,
      brandId: this.profileBrandId(),
      materialTypeId: this.profileMaterialTypeId(),
      ironingFlowPercentage: this.profileIroningFlow() ?? undefined,
      ironingSpeedMmS: this.profileIroningSpeed() ?? undefined,
      slopeAngleForSupports: this.profileSlopeAngle() ?? undefined,
      zSeparationForSupports: this.profileZSeparation() ?? undefined,
    };

    try {
      await firstValueFrom(this.filamentRepository.updateFilamentProfile(payload));
      await this.loadProfiles();
      this.cancelEditProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error}`);
    }
  }

  protected saveProfile(): void {
    if (this.isEditingProfile()) {
      void this.updateProfile();
    } else {
      void this.addProfile();
    }
  }

  private resetProfileForm(): void {
    this.editingProfileId.set('');
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

  protected openEditModal(filament: Filament): void {
    this.editFilamentId.set(filament.id);
    this.editMinCost.set(filament.minCost);
    this.editMaxCost.set(filament.maxCost);
    this.editLastCost.set(filament.lastCost);
    this.editBuyAgain.set(filament.buyAgain ?? false);
    this.editBuyLink.set(filament.buyLink ?? '');
    this.editLastPurchaseDate.set(filament.lastPurchaseDate ? filament.lastPurchaseDate.substring(0, 10) : '');
    this.editRemainingWeight.set(filament.remainingWeightGrams);
    this.editOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editOpen.set(false);
    this.resetEditForm();
  }

  protected async updateFilament(): Promise<void> {
    const payload: FilamentUpdate = {
      id: this.editFilamentId(),
      remainingWeightGrams: this.editRemainingWeight() ?? undefined,
      minCost: this.editMinCost() ?? undefined,
      maxCost: this.editMaxCost() ?? undefined,
      lastCost: this.editLastCost() ?? undefined,
      lastPurchaseDate: this.editLastPurchaseDate() || undefined,
      buyLink: this.editBuyLink() || undefined,
      buyAgain: this.editBuyAgain(),
    };

    this.editLoading.set(true);
    try {
      await firstValueFrom(this.filamentRepository.updateFilament(payload));
      await this.loadFilaments();
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating filament:', error);
      alert(`Error: ${error}`);
    } finally {
      this.editLoading.set(false);
    }
  }

  private resetEditForm(): void {
    this.editFilamentId.set('');
    this.editMinCost.set(null);
    this.editMaxCost.set(null);
    this.editLastCost.set(null);
    this.editBuyAgain.set(false);
    this.editBuyLink.set('');
    this.editLastPurchaseDate.set('');
    this.editRemainingWeight.set(null);
  }

  protected openDeleteModal(filament: Filament): void {
    this.deleteFilamentId.set(filament.id);
    this.deleteFilamentName.set(`${filament.filamentProfile.brandName} - ${filament.filamentProfile.materialTypeName}`);
    this.deleteOpen.set(true);
  }

  protected closeDeleteModal(): void {
    this.deleteOpen.set(false);
    this.deleteFilamentId.set('');
    this.deleteFilamentName.set('');
  }

  protected async confirmDelete(): Promise<void> {
    this.deleteLoading.set(true);
    try {
      await firstValueFrom(this.filamentRepository.deleteFilament(this.deleteFilamentId()));
      await this.loadFilaments();
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting filament:', error);
      alert(`Error: ${error}`);
    } finally {
      this.deleteLoading.set(false);
    }
  }

  protected openAdjustWeightModal(filament: Filament): void {
    this.adjustWeightFilamentId.set(filament.id);
    this.adjustWeightGrams.set(null);
    this.adjustWeightOpen.set(true);
  }

  protected closeAdjustWeightModal(): void {
    this.adjustWeightOpen.set(false);
    this.adjustWeightFilamentId.set('');
    this.adjustWeightGrams.set(null);
  }

  protected async adjustWeight(action: 'add' | 'subtract'): Promise<void> {
    const grams = this.adjustWeightGrams();
    if (grams === null || grams <= 0) {
      alert('Please enter a valid quantity greater than 0.');
      return;
    }

    const payload: AdjustFilamentWeight = {
      filamentId: this.adjustWeightFilamentId(),
      grams: action === 'add' ? grams : -grams,
    };

    this.adjustWeightLoading.set(true);
    try {
      await firstValueFrom(this.filamentRepository.adjustFilamentWeight(payload));
      await this.loadFilaments();
      this.closeAdjustWeightModal();
    } catch (error) {
      console.error(`Error ${action === 'add' ? 'adding' : 'subtracting'} weight:`, error);
      alert(`Error: ${error}`);
    } finally {
      this.adjustWeightLoading.set(false);
    }
  }
}
