import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentProfile } from '../../../../domain/models/filament-profile.model';
import { FilamentColor } from '../../../../domain/models/filament-color.model';
import { Filament, FilamentCreate } from '../../../../domain/models/filament.model';

@Component({
  selector: 'app-filament-form',
  standalone: true,
  template: `<div class="modal">
    <div class="modal-backdrop" (click)="onCancel()"></div>
    <div class="modal-content">
      <header>
        <h3>{{ isEdit ? 'Edit Filament' : 'Add New Filament' }}</h3>
        <button class="close" (click)="onCancel()">✕</button>
      </header>

      <div class="body">
        <div class="add-form">
          <label>Filament Profile:</label>
          <select [value]="selectedProfileId" (change)="selectedProfileId = $any($event.target).value">
            <option value="">Select Profile</option>
            <option *ngFor="let p of profiles" [value]="p.id">{{ p.brandName }} - {{ p.materialTypeName }}</option>
          </select>

          <label>Color:</label>
          <select [value]="selectedColorId" (change)="selectedColorId = $any($event.target).value">
            <option value="">Select Color</option>
            <option *ngFor="let c of colors" [value]="c.id">{{ c.color }} ({{ c.colorCode }})</option>
          </select>

          <label>Min Cost:</label>
          <input type="number" [value]="minCost" (input)="minCost = $any($event.target).value ? +$any($event.target).value : null" />

          <label>Max Cost:</label>
          <input type="number" [value]="maxCost" (input)="maxCost = $any($event.target).value ? +$any($event.target).value : null" />

          <label>Last Cost:</label>
          <input type="number" [value]="lastCost" (input)="lastCost = $any($event.target).value ? +$any($event.target).value : null" />

          <label>Remaining Weight (g):</label>
          <input type="number" [value]="remainingWeight" (input)="remainingWeight = $any($event.target).value ? +$any($event.target).value : null" />

          <label>Last Purchase Date:</label>
          <input type="date" [value]="lastPurchaseDate" (input)="lastPurchaseDate = $any($event.target).value" />

          <label>Buy Link:</label>
          <input type="text" [value]="buyLink" (input)="buyLink = $any($event.target).value" placeholder="https://..." />

          <label class="checkbox-label">
            <input type="checkbox" [checked]="buyAgain" (change)="buyAgain = $any($event.target).checked" />
            Buy Again
          </label>

          <button class="primary" (click)="onSubmit()" [disabled]="loading">{{ loading ? 'Saving...' : 'Save' }}</button>
          <button class="secondary" (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
  </div>`,
  imports: [CommonModule]
})
export class FilamentFormComponent {
  @Input() profiles: FilamentProfile[] = [];
  @Input() colors: FilamentColor[] = [];
  @Input() isEdit = false;
  @Input() filament?: Filament;
  @Input() loading = false;
  @Output() save = new EventEmitter<FilamentCreate | Partial<Filament> & { id: string }>();
  @Output() cancel = new EventEmitter<void>();

  selectedProfileId = '';
  selectedColorId = '';
  minCost: number | null = null;
  maxCost: number | null = null;
  lastCost: number | null = null;
  remainingWeight: number | null = null;
  lastPurchaseDate = '';
  buyLink = '';
  buyAgain = false;

  ngOnChanges(): void {
    if (this.filament && this.isEdit) {
      this.selectedProfileId = this.filament.filamentProfileId || '';
      this.selectedColorId = this.filament.filamentColorId || '';
      this.minCost = this.filament.minCost ?? null;
      this.maxCost = this.filament.maxCost ?? null;
      this.lastCost = this.filament.lastCost ?? null;
      this.remainingWeight = this.filament.remainingWeightGrams ?? null;
      this.lastPurchaseDate = this.filament.lastPurchaseDate ? this.filament.lastPurchaseDate.substring(0, 10) : '';
      this.buyLink = this.filament.buyLink ?? '';
      this.buyAgain = this.filament.buyAgain ?? false;
    } else {
      this.selectedProfileId = '';
      this.selectedColorId = '';
      this.minCost = null;
      this.maxCost = null;
      this.lastCost = null;
      this.remainingWeight = null;
      this.lastPurchaseDate = '';
      this.buyLink = '';
      this.buyAgain = false;
    }
  }

  onSubmit(): void {
    if (!this.selectedProfileId || !this.selectedColorId) {
      alert(this.isEdit ? 'Please select a filament profile' : 'Please select a filament profile');
      return;
    }

    if (this.minCost === null || this.maxCost === null || this.lastCost === null) {
      alert('Please fill in all cost fields');
      return;
    }

    if (this.isEdit && this.filament) {
      this.save.emit({
        id: this.filament.id,
        filamentProfileId: this.selectedProfileId,
        filamentColorId: this.selectedColorId,
        minCost: this.minCost,
        maxCost: this.maxCost,
        lastCost: this.lastCost,
        buyAgain: this.buyAgain,
        buyLink: this.buyLink || undefined,
        lastPurchaseDate: this.lastPurchaseDate || undefined,
        remainingWeightGrams: this.remainingWeight ?? undefined
      });
    } else {
      this.save.emit({
        filamentProfileId: this.selectedProfileId,
        filamentColorId: this.selectedColorId,
        minCost: this.minCost,
        maxCost: this.maxCost,
        lastCost: this.lastCost,
        buyAgain: this.buyAgain,
        buyLink: this.buyLink || undefined,
        lastPurchaseDate: this.lastPurchaseDate || undefined,
        remainingWeightGrams: this.remainingWeight ?? undefined
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}