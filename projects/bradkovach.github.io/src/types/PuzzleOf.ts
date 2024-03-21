import { BoardOf } from './BoardOf';
import { LevelOf } from './LevelOf';

export type PuzzleOf<TileType> = {
  id: number;
  groups: Record<string, LevelOf<TileType>>;
  startingGroups: BoardOf<TileType>;
};
