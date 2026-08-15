import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentBrand } from '../../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate } from '../../../../domain/models/filament-profile.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ListStateComponent } from '../../../../shared/ui/list-state/list-state.component';

@Component({
  selector: 'app-profiles-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ListStateComponent],
  templateUrl: './profiles-modal.component.html'
})
export class ProfilesModalComponent {
  @Input() brands: FilamentBrand[] = [];
  @Input() materialTypes: FilamentMaterialType[] = [];
  @Input() profiles: FilamentProfile[] = [];
  @Input() loading = false;
  @Output() addProfile = new EventEmitter<FilamentProfileCreate>();
  @Output() close = new EventEmitter<void>();

  profileBrandId = '';
  profileMaterialTypeId = '';
  profileIroningFlow: number | null = null;
  profileIroningSpeed: number | null = null;
  profileSlopeAngle: number | null = null;
  profileZSeparation: number | null = null;

  onAdd(): void {
    if (!this.profileBrandId || !this.profileMaterialTypeId) {
      alert('Please select both Brand and Material Type');
      return;
    }

    const payload: FilamentProfileCreate = {
      brandId: this.profileBrandId,
      materialTypeId: this.profileMaterialTypeId,
      ironingFlowPercentage: this.profileIroningFlow ?? undefined,
      ironingSpeedMmS: this.profileIroningSpeed ?? undefined,
      slopeAngleForSupports: this.profileSlopeAngle ?? undefined,
      zSeparationForSupports: this.profileZSeparation ?? undefined,
    };

    this.addProfile.emit(payload);
    this.resetForm();
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.profileBrandId = '';
    this.profileMaterialTypeId = '';
    this.profileIroningFlow = null;
    this.profileIroningSpeed = null;
    this.profileSlopeAngle = null;
    this.profileZSeparation = null;
  }
}