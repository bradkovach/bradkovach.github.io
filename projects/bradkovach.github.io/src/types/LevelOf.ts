import { ArrayRowOf } from './RowOf';

export type LevelOf<T> = {
  level: number;
  members: ArrayRowOf<T>;
};
