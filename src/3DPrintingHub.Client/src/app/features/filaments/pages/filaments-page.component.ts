import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FilamentRepository } from '../../../data/repositories/filament.repository';
import { FilamentColor } from '../../../domain/models/filament-color.model';

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

  ngOnInit(): void {
    void this.loadColors();
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
}
