import { Pipe, PipeTransform } from '@angular/core';
import { SharePriceRow } from '../price-by-schedule/PriceBySchedulePipe';
import { Chain, Player, Schedule } from '../types';

@Pipe({
  name: 'netWorth',
  standalone: true,
})
export class NetWorthPipe implements PipeTransform {
  transform(
    player: Player,
    chainTileCounts: Record<Chain, number>,
    chainToTier: Record<Chain, Schedule>,
    schedules: SharePriceRow[],
  ): number {
    console.log(`${player.name} net worth`);
    let netWorth = 0;

    if (player.cash > 0) {
      netWorth += player.cash;
      console.log(`  Cash:     ${player.cash}`);
    }

    const chainKeys = Object.keys(chainTileCounts) as unknown as Chain[];
    for (const chain of chainKeys) {
      const playerShares = player[chain];
      if (playerShares === 0) {
        continue;
      }

      const chainTileCount = chainTileCounts[chain];
      if (chainTileCount === 0) {
        continue;
      }

      const tier = chainToTier[chain];
      // reverse sort the schedules so we can find the first one that matches
      const currentScheduleRow = schedules
        .reduce((reversed, bracket) => {
          return [bracket, ...reversed];
        }, [] as SharePriceRow[])
        .find(([threshold]) => chainTileCount >= threshold);

      if (!currentScheduleRow) {
        continue;
      }

      const pricePerShare = currentScheduleRow[tier];
      const playerShareValue = playerShares * pricePerShare;

      console.log(
        `  ${Chain[chain]}: ${playerShares} shares @ ${pricePerShare} = ${playerShareValue}`,
      );
      netWorth += playerShareValue;
    }

    console.log(`  Total:    ${netWorth}`);

    return netWorth;
  }
}
