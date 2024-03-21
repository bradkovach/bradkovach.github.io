import { Pipe, PipeTransform } from '@angular/core';
import { Schedule } from '../types';

export type SharePriceRow = [number, number, number, number] & {
  length: 4;
};

@Pipe({
  name: 'priceBySchedule',
  standalone: true,
})
export class PriceBySchedulePipe implements PipeTransform {
  transform<I, T extends any[]>(
    currentTiles: number,
    scheduleColumn: Schedule,
    schedules: SharePriceRow[],
  ): number {
    const scheduleRow = [...schedules]
      // sort by the first column, desending
      .sort((a, b) => b[0] - a[0])
      .find(([threshold]) => currentTiles >= threshold);

    if (!scheduleRow) {
      return 0;
    }

    return scheduleRow[scheduleColumn];
  }
}
