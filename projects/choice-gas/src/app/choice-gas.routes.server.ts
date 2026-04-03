import type { ServerRoute } from '@angular/ssr';

import { RenderMode } from '@angular/ssr';

import tuples from '../../routes.json';

export const serverRoutes: ServerRoute[] = [
	{
		getPrerenderParams() {
			return Promise.resolve(
				tuples.map(([vendorId, offerId]) => ({ offerId, vendorId })),
			);
		},
		path: 'vendors/:vendorId/offers/:offerId',
		renderMode: RenderMode.Prerender,
	},
	{
		getPrerenderParams() {
			const uniqueVendorIds = new Set(
				tuples.map(([vendorId]) => vendorId),
			);
			return Promise.resolve(
				Array.from(uniqueVendorIds).map((vendorId) => ({ vendorId })),
			);
		},
		path: 'vendors/:vendorId/offers',
		renderMode: RenderMode.Prerender,
	},
	{
		getPrerenderParams() {
			const uniqueVendorIds = new Set(
				tuples.map(([vendorId]) => vendorId),
			);
			return Promise.resolve(
				Array.from(uniqueVendorIds).map((vendorId) => ({ vendorId })),
			);
		},
		path: 'vendors/:vendorId',
		renderMode: RenderMode.Prerender,
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender,
	},
];
