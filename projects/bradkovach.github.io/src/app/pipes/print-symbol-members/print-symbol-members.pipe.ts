import type { PipeTransform } from '@angular/core';

import type { SymbolMemberRow } from '../../../types/SymbolMemberRow';

import { Pipe } from '@angular/core';

@Pipe({
  name: 'printSymbolMembers',
  standalone: true,
})
export class PrintSymbolMembersPipe implements PipeTransform {
  transform(tiles: SymbolMemberRow, ...args: unknown[]): unknown {
    return [...tiles].map((member) => member.label).join(', ');
  }
}
