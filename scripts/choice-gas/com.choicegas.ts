import type { Offer } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

import * as cheerio from 'cheerio';

import { FixedPerThermOfferSchema } from '../../projects/bradkovach.github.io/src/app/routes/choice-gas/entity/Offer';

const url =
	'https://www.blackhillsenergy.com/services/choice-gas-program/wyoming-choice-gas-customers/black-hills-wyoming-gas-llc-utility-gas';

/*
	As of 2025-04-03, this is the structure of the data on the scraped page:

	<div class="article--content__description">

		<!-- ... -->

		<table border="1" cellpadding="1" cellspacing="1">
			<thead>
				<tr>
					<th scope="col">Division</th>
					<th scope="col">Price&nbsp;per therm</th>
					<th scope="col">Confirmation code</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Casper</td>
					<td>$0.4759</td>
					<td>99001</td>
				</tr>
				<tr>
					<td>Gillette</td>
					<td>$0.4759</td>
					<td>99004</td>
				</tr>
				<tr>
					<td>Torrington</td>
					<td>$0.4759</td>
					<td>99003</td>
				</tr>
			</tbody>
		</table>

		<!-- ... -->

	</div>

*/
export const run = (): Promise<Offer[]> =>
	fetch(url)
		.then((response) => response.text())
		.then((text) => cheerio.load(text))
		.then(($) =>
			$(
				'.article--content__description > table:nth-of-type(1) > tbody > tr',
			)
				.toArray()
				.map((tr) => {
					const tds = $(tr).find('td');
					const [division, priceText, confirmationCode] = tds
						.toArray()
						.map((td) => $(td).text().trim());

					return FixedPerThermOfferSchema.parse({
						confirmationCode,
						id: `gca-${division}`,
						name: `Gas Cost Adjustment - ${division} Division`,
						rate: Number(priceText.slice(1)),
						term: 1,
						type: 'fpt',
					});
				})
				// Some day, this tool will allow you to see prices in many divisions.
				// For now, we only care about Casper.
				.filter((o) => o.id === 'gca-Casper'),
		);
