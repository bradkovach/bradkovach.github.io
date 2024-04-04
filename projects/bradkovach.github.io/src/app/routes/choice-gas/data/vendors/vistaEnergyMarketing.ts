import { Vendor } from '../../entity/Vendor';
import { Market } from '../data.current';

export const vistaEnergyMarketing = new Vendor(
  'com.vistaenergymarketing',
  'Vista Energy Marketing',
  'https://vistaenergymarketing.com',
  '8885084782',
)
  // id	name	type	market	rate	term	confirmationCode
  // fpm-1	Go Pokes Fixed Bill	fpm		0	1	76515
  .addOffer({
    id: 'fpm-1',
    name: 'Go Pokes Fixed Bill',
    type: 'fpm',
    term: 1,
    rate: 0,
    confirmationCode: '76515',
  })
  // fpm-2	Go Pokes Fixed Bill	fpm		0	2	76517
  .addOffer({
    id: 'fpm-2',
    name: 'Go Pokes Fixed Bill',
    type: 'fpm',
    term: 2,
    rate: 0,
    confirmationCode: '76517',
  })
  // fpt-1	Go Pokes Fixed Price	fpt		0.415	1	76058
  .addOffer({
    id: 'fpt-1',
    name: 'Go Pokes Fixed Price',
    type: 'fpt',
    term: 1,
    rate: 0.415,
    confirmationCode: '76058',
  })
  // fpt-2	Go Pokes Fixed Price	fpt		0.445	2	76211
  .addOffer({
    id: 'fpt-2',
    name: 'Go Pokes Fixed Price',
    type: 'fpt',
    term: 2,
    rate: 0.445,
    confirmationCode: '76211',
  })
  // index-1	Go Pokes Index Price	market	CIG	0.09	1	76320
  .addOffer({
    id: 'index-1',
    name: 'Go Pokes Index Price',
    type: 'market',
    market: Market.CIG,
    term: 1,
    rate: 0.09,
    confirmationCode: '76320',
  })
  // index-2	Go Pokes Index Price	market	CIG	0.085	2	76513
  .addOffer({
    id: 'index-2',
    name: 'Go Pokes Index Price',
    type: 'market',
    market: Market.CIG,
    term: 2,
    rate: 0.085,
    confirmationCode: '76513',
  })
  // gca-1	GLTGCA	market	GCA	-0.01	1	76519
  .addOffer({
    id: 'gca-1',
    name: 'GLTGCA',
    type: 'market',
    market: Market.GCA,
    term: 1,
    rate: -0.01,
    confirmationCode: '76519',
  });
