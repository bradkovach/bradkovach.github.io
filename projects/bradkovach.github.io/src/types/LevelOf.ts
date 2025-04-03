import type { ArrayRowOf } from './RowOf';

export interface LevelOf<T> {
  level: number;
  members: ArrayRowOf<T>;
}
