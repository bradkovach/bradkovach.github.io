import type { BoardOf } from './BoardOf';
import type { LevelOf } from './LevelOf';

export interface PuzzleOf<TileType> {
  groups: Record<string, LevelOf<TileType>>;
  id: number;
  startingGroups: BoardOf<TileType>;
}
