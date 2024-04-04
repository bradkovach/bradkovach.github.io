import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const symmetryEnergySolutions = new Vendor(
  'com.symmetryenergy',
  'Symmetry Energy Solutions',
  'https://symmetryenergy.com/choice',
  '8882003788',
)

  // id	name	type	market	rate	term	confirmationCode
  // fpt-1	Fixed Rate - Residential	fpt		0.439	1
  .addOffer({
    id: 'fpt-1',
    name: 'Fixed Rate - Residential',
    type: 'fpt',
    term: 1,
    rate: 0.439,
  })
  // fpt-2	Fixed Rate - Residential	fpt		0.475	2
  .addOffer({
    id: 'fpt-2',
    name: 'Fixed Rate - Residential',
    type: 'fpt',
    term: 2,
    rate: 0.475,
  })
  // cig-1	CIG Market Index	market	CIG	0.059	1
  .addOffer({
    id: 'cig-1',
    name: 'CIG Market Index',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.059,
  })
  // cig-2	CIG Market Index	market	cig	0.059	2
  .addOffer({
    id: 'cig-2',
    name: 'CIG Market Index',
    type: 'market',
    market: Market.CIG,
    term: 2,
    rate: 0.059,
  })
  // managed-1	Managed Rate	market	GCA	-0.11	1
  .addOffer({
    id: 'managed-1-gca',
    name: 'Managed Rate (if based on GCA)',
    type: 'market',
    market: Market.GCA,
    term: 1,
    rate: -0.0142,
  });
