import { Component, OnInit, input, output, signal } from '@angular/core';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { Setting } from '../../../../domain/models/setting.model';

export interface SettingFormValue {
  parameter: string;
  value: number | null;
}

/**
 * Feature component that owns the "Edit Setting" form markup and its fields.
 * The page keeps the state and the repository call; this component only
 * presents the current setting and emits the values the operator typed.
 */
@Component({
  selector: 'app-setting-form-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './setting-form-modal.component.html'
})
export class SettingFormModalComponent implements OnInit {
  readonly setting = input<Setting | null>(null);
  readonly loading = input(false);

  readonly save = output<SettingFormValue>();
  readonly cancel = output<void>();

  protected readonly parameter = signal('');
  protected readonly value = signal<number | null>(null);

  ngOnInit(): void {
    this.parameter.set(this.setting()?.parameter ?? '');
    this.value.set(this.setting()?.value ?? null);
  }

  protected onSave(): void {
    this.save.emit({ parameter: this.parameter(), value: this.value() });
  }
}
