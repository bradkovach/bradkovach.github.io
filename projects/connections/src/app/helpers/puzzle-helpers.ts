import { BoardOf } from '../../types/BoardOf';
import { StringLevel } from '../../types/StringLevel';
import { StringPuzzle } from '../../types/StringPuzzle';
import { SymbolPuzzle } from '../../types/SymbolPuzzle';

export class PuzzleHelpers {
  static toStringPuzzle(puzzle: SymbolPuzzle): StringPuzzle {
    const groups = Object.entries(puzzle.groups).reduce(
      (acc, [category, group]) => {
        acc[category] = {
          level: group.level,
          members: group.members.map((member) => member.label),
        } as StringLevel;
        return acc;
      },
      {} as Record<string, StringLevel>,
    );

    const startingGroups: BoardOf<string> = puzzle.startingGroups.map((group) =>
      group.map((member) => member.label),
    ) as BoardOf<string>;

    return {
      id: puzzle.id,
      groups,
      startingGroups,
    };
  }

  static fromBase64(base64: string): StringPuzzle {
    const json = atob(base64);
    const puzzle = JSON.parse(json);
    return puzzle as StringPuzzle;
  }

  static toBase64(subject: object): string {
    const json = JSON.stringify(subject).replace(/[\u007F-\uFFFF]/g, (chr) => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
    });
    return btoa(json);
  }
}
