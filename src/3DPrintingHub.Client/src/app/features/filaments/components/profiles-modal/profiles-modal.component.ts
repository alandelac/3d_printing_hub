import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentBrand } from '../../../../domain/models/filament-brand.model';
import { FilamentMaterialType } from '../../../../domain/models/filament-material-type.model';
import { FilamentProfile, FilamentProfileCreate } from '../../../../domain/models/filament-profile.model';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';

@Component({
  selector: 'app-profiles-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, TableComponent],
  templateUrl: './profiles-modal.component.html'
})
export class ProfilesModalComponent {
  readonly columns: TableColumn<FilamentProfile>[] = [
    { key: 'brand', header: 'Brand', value: profile => profile.brandName },
    { key: 'materialType', header: 'Material Type', value: profile => profile.materialTypeName },
    { key: 'ironingFlow', header: 'Ironing Flow %', value: profile => profile.ironingFlowPercentage },
    { key: 'ironingSpeed', header: 'Ironing Speed', value: profile => profile.ironingSpeedMmS },
    { key: 'slopeAngle', header: 'Slope Angle', value: profile => profile.slopeAngleForSupports },
    { key: 'zSeparation', header: 'Z Separation', value: profile => profile.zSeparationForSupports }
  ];

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