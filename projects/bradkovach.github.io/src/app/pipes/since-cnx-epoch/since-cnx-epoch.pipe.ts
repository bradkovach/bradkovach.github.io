import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'epochToDate',
  standalone: true,
})
export class EpochToDatePipe implements PipeTransform {
  // the first day the Connections puzzle was published.
  public static readonly cnxEpoch = new Date('2023-06-11T00:00:00.000Z');

  transform(puzzleIdx: number): Date {
    // add puzzleIdx days to cnxEpoch and subtract 1 day to get the date of the puzzle.
    const puzzleDate = new Date(EpochToDatePipe.cnxEpoch);
    puzzleDate.setDate(puzzleDate.getDate() + puzzleIdx - 1);

    return puzzleDate;
  }
}
