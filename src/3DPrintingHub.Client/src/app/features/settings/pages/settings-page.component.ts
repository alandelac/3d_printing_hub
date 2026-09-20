import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SettingRepository } from '../../../data/repositories/setting.repository';
import { Setting } from '../../../domain/models/setting.model';
import { TableCellDirective, TableColumn, TableComponent } from '../../../shared/ui/table/table.component';
import {
  SettingFormModalComponent,
  SettingFormValue
} from '../components/setting-form-modal/setting-form-modal.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, TableComponent, TableCellDirective, SettingFormModalComponent],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  private settingRepository = inject(SettingRepository);
  protected readonly title = signal('Settings');

  protected readonly columns: TableColumn<Setting>[] = [
    { key: 'parameter', header: 'Parameter', value: setting => setting.parameter },
    { key: 'value', header: 'Value', value: setting => setting.value },
    { key: 'actions', header: 'Actions' }
  ];

  protected settings = signal<Setting[]>([]);
  protected loading = signal(false);

  // Edit modal state
  protected editOpen = signal(false);
  protected editLoading = signal(false);
  protected editSetting = signal<Setting | null>(null);

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
    this.editSetting.set(setting);
    this.editOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editOpen.set(false);
    this.editSetting.set(null);
  }

  protected async updateSetting(form: SettingFormValue): Promise<void> {
    const setting = this.editSetting();
    if (!setting || form.value === null) {
      return;
    }

    this.editLoading.set(true);
    try {
      await firstValueFrom(
        this.settingRepository.updateSetting(setting.id, {
          parameter: form.parameter,
          value: form.value
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
