import { Component, input } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Wraps a projected list/table and renders the shared Loading / content / empty states.
 *
 * Usage:
 *   <app-list-state [loading]="loading" [hasData]="items.length" emptyText="No items found.">
 *     <table>...</table>
 *   </app-list-state>
 */
@Component({
  selector: 'app-list-state',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="loading()">Loading...</div>
    <div *ngIf="!loading() && hasData()">
      <ng-content></ng-content>
    </div>
    <div *ngIf="!loading() && !hasData()">{{ emptyText() }}</div>
  `
})
export class ListStateComponent {
  readonly loading = input(false);
  readonly hasData = input(false);
  readonly emptyText = input('No results found.');
}