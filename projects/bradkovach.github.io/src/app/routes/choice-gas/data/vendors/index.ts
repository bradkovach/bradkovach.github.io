import { Vendor } from '../../entity/Vendor';
import { archerEnergy } from './archerEnergy';
import { blackHillsEnergyServices } from './blackHillsEnergyServices';
import { blackHillsWyomingGas } from './blackHillsWyomingGas';
import { legacyNaturalGas } from './legacyNaturalGas';
import { symmetryEnergySolutions } from './symmetryEnergySolutions';
import { uncleFrankEnergyServices } from './uncleFrankEnergyServices';
import { vistaEnergyMarketing } from './vistaEnergyMarketing';
import { woodRiverEnergy } from './woodRiverEnergy';
import { wyomingCommunityGas } from './wyomingCommunityGas';
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

export default vendors;
