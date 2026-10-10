import { Component, ElementRef, HostListener, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilamentColor } from '../../../../domain/models/filament-color.model';

/**
 * Presentational color picker used by the filament form.
 * Renders a native <select> (kept for keyboard/assistive tech and existing
 * specs) plus a visual dropdown + preview that shows each color swatch
 * exactly like the filaments table (`.swatch` + name + hex code).
 *
 * Usage:
 *   <app-color-select
 *     [colors]="colors()"
 *     [value]="filamentColorId()"
 *     (valueChange)="filamentColorId.set($event)"
 *   />
 */
@Component({
  selector: 'app-color-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="color-select">
      <select
        class="sr-only"
        aria-label="Color"
        tabindex="-1"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
      >
        <option value="">Select Color</option>
        <option *ngFor="let c of colors()" [value]="c.id">{{ c.color }} ({{ c.colorCode }})</option>
      </select>

      <button
        type="button"
        class="color-select-trigger"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="swatch" *ngIf="selected()" [style.background]="selected()!.colorCode"></span>
        <span class="color-select-label">
          {{ selected() ? selected()!.color + ' (' + selected()!.colorCode + ')' : 'Select Color' }}
        </span>
        <span class="color-select-caret" aria-hidden="true">▾</span>
      </button>

      <ul *ngIf="open()" class="color-select-options" role="listbox" aria-label="Color">
        <li *ngIf="!colors().length" class="color-select-empty">No colors available.</li>
        <li *ngFor="let c of colors()" role="option" [attr.aria-selected]="c.id === value()">
          <button type="button" (click)="pick(c.id)">
            <span class="swatch" [style.background]="c.colorCode"></span>
            <span>{{ c.color }} ({{ c.colorCode }})</span>
          </button>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    :host { display: block; flex: 1 1 200px; min-width: 150px; }
    .color-select { position: relative; width: 100%; }
    .sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
    }
    .color-select-trigger {
      display: flex; align-items: center; gap: 0.5rem; width: 100%;
      padding: 0.4rem; border: 1px solid var(--input-border); border-radius: 4px;
      background: var(--input-bg); color: var(--input-text); cursor: pointer;
    }
    .color-select-caret { margin-left: auto; color: var(--text-muted); }
    .color-select-options {
      position: absolute; z-index: 70; left: 0; right: 0; top: calc(100% + 4px);
      max-height: 240px; overflow-y: auto; margin: 0; padding: 0.25rem; list-style: none;
      background: var(--modal-bg); color: var(--text);
      border: 1px solid var(--input-border); border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
    }
    .color-select-options button {
      display: flex; align-items: center; gap: 0.5rem; width: 100%;
      padding: 0.4rem; border: none; border-radius: 4px; cursor: pointer;
      background: transparent; color: inherit; text-align: left;
    }
    .color-select-options button:hover { background: var(--bg-muted); }
    .color-select-empty { padding: 0.4rem; color: var(--text-muted); }
    .swatch {
      display: inline-block; width: 16px; height: 16px; flex: 0 0 16px;
      border-radius: 3px; border: 1px solid rgba(0,0,0,0.06);
    }
  `]
})
export class ColorSelectComponent {
  readonly colors = input<FilamentColor[]>([]);
  readonly value = model<string>('');

  protected readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event.target'])
  protected onDocumentClick(target: EventTarget | null): void {
    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  protected selected(): FilamentColor | undefined {
    return this.colors().find(c => c.id === this.value());
  }

  protected toggle(): void {
    this.open.update(v => !v);
  }

  protected pick(id: string): void {
    this.value.set(id);
    this.open.set(false);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open.set(true);
    } else if (event.key === 'Escape') {
      this.open.set(false);
    }
  }
}
