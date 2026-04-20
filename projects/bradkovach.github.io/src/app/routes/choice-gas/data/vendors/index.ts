import type { Vendor } from '../../entity/Vendor';

import { archerEnergy } from './archerEnergy';
import { woodRiverEnergy } from './woodRiverEnergy';
import { legacyNaturalGas } from './legacyNaturalGas';
import { wyomingCommunityGas } from './wyomingCommunityGas';
import { blackHillsWyomingGas } from './blackHillsWyomingGas';
import { vistaEnergyMarketing } from './vistaEnergyMarketing';
import { symmetryEnergySolutions } from './symmetryEnergySolutions';
import { blackHillsEnergyServices } from './blackHillsEnergyServices';
import { uncleFrankEnergyServices } from './uncleFrankEnergyServices';
import { wyomingProducerConsumerAlliance } from './wyomingProducerConsumerAlliance';

export const vendors: Vendor[] = [
  vistaEnergyMarketing,
  symmetryEnergySolutions,
  blackHillsEnergyServices,
  woodRiverEnergy,
  archerEnergy,
  uncleFrankEnergyServices,
  wyomingProducerConsumerAlliance,
  wyomingCommunityGas,
  legacyNaturalGas,
  blackHillsWyomingGas,
];
