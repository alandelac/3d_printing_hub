import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SettingRepository } from '../../../data/repositories/setting.repository';
import { Setting } from '../../../domain/models/setting.model';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  private settingRepository = inject(SettingRepository);
  protected readonly title = signal('Settings');

  protected settings = signal<Setting[]>([]);
  protected loading = signal(false);

  // Edit modal state
  protected editOpen = signal(false);
  protected editLoading = signal(false);
  protected editSettingId = signal('');
  protected editParameter = signal('');
  protected editValue = signal<number | null>(null);

  ngOnInit(): void {
    void this.loadSettings();
  }

  protected async loadSettings(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.settingRepository.getAllSettings());
      this.settings.set(data ?? []);
    } catch (error) {
      console.error('Error loading settings:', error);
      alert(`Error: ${error}`);
    } finally {
      this.loading.set(false);
    }
  }

  protected openEditModal(setting: Setting): void {
    this.editSettingId.set(setting.id);
    this.editParameter.set(setting.parameter);
    this.editValue.set(setting.value);
    this.editOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editOpen.set(false);
    this.editSettingId.set('');
    this.editParameter.set('');
    this.editValue.set(null);
  }

  protected async updateSetting(): Promise<void> {
    if (!this.editSettingId() || this.editValue() === null) {
      return;
    }

    this.editLoading.set(true);
    try {
      await firstValueFrom(
        this.settingRepository.updateSetting(this.editSettingId(), {
          parameter: this.editParameter(),
          value: this.editValue()!
        })
      );

      await this.loadSettings();
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating setting:', error);
      alert(`Error updating setting: ${error}`);
    } finally {
      this.editLoading.set(false);
    }
  }
}
