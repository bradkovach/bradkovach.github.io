import { Pipe, PipeTransform } from '@angular/core';
import { SymbolMemberRow } from '../../../types/SymbolMemberRow';

@Pipe({
  name: 'printSymbolMembers',
  standalone: true,
})
export class PrintSymbolMembersPipe implements PipeTransform {
  transform(tiles: SymbolMemberRow, ...args: unknown[]): unknown {
    return [...tiles].map((member) => member.label).join(', ');
  }
}
