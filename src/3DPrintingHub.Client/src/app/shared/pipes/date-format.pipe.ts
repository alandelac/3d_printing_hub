import { Pipe, PipeTransform } from '@angular/core';
import { formatIsoDate } from '../utils/date-format';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatIsoDate(value);
  }
}
