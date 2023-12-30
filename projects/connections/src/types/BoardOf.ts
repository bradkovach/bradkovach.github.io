import { ArrayRowOf } from './RowOf';

export type BoardOf<TileType> = [
  ArrayRowOf<TileType>,
  ArrayRowOf<TileType>,
  ArrayRowOf<TileType>,
  ArrayRowOf<TileType>,
];
