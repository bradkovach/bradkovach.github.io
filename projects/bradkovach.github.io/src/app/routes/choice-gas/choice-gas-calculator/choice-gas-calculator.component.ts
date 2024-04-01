// import { AgGridAngular } from '@ag-grid-community/angular';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import {
// 	ColDef,
// 	ModuleRegistry,
// 	ValueFormatterParams,
// 	ValueGetterParams,
// } from '@ag-grid-community/core';
import {
	AsyncPipe,
	DecimalPipe,
	JsonPipe,
	KeyValuePipe,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from '../../../app.component';
import { BillPipe } from '../bill.pipe';
import { BillComponent } from '../bill/bill.component';
import { DataService } from '../data.service';
import { ChargeType } from '../entity/ChargeType';
import { FixedArray } from '../entity/FixedArray';
import { Market } from './Market';
import { marketLabels } from './marketLabels';
import { vendors } from './vendors';

export enum Month {
	January,
	February,
	March,
	April,
	May,
	June,
	July,
	August,
	September,
	October,
	November,
	December,
}

export const monthLabels: Record<Month, string> = {
	[Month.January]: 'January',
	[Month.February]: 'February',
	[Month.March]: 'March',
	[Month.April]: 'April',
	[Month.May]: 'May',
	[Month.June]: 'June',
	[Month.July]: 'July',
	[Month.August]: 'August',
	[Month.September]: 'September',
	[Month.October]: 'October',
	[Month.November]: 'November',
	[Month.December]: 'December',
};

export const thermUsageDefaults: FixedArray<number, 12> = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

// ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
	selector: 'app-choice-gas-calculator',
	standalone: true,
	imports: [
		FormsModule,
		JsonPipe,
		BillPipe,
		BillComponent,
		KeyValuePipe,
		DecimalPipe,
		// AgGridAngular,
		AsyncPipe,
	],
	templateUrl: './choice-gas-calculator.component.html',

	styleUrls: [
		`/node_modules/@ag-grid-community/styles/ag-grid.css`,
		`/node_modules/@ag-grid-community/styles/ag-theme-quartz.css`,
		`./choice-gas-calculator.component.scss`,
	],
	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoiceGasCalculatorComponent {
	// readonly vendors = vendors;
	readonly marketLabels = marketLabels;

	readonly dataService = inject(DataService);

	readonly ChargeType = ChargeType;
	usage = this.dataService.usage;

	get MonthKeys(): Month[] {
		return Object.keys(monthLabels) as unknown as Month[];
	}

	get MonthLabels(): Month[] {
		return Object.values(monthLabels) as unknown as Month[];
	}

	get MarketKeys(): Market[] {
		return Object.keys(marketLabels) as unknown as Market[];
	}

	appComponent = inject(AppComponent);

	constructor() {
		this.appComponent.setContainerMode('fluid');
	}

	vendors = vendors;

	charges = this.dataService.charges;

	rates = this.dataService.rates;

	addCharge() {
		const charges = { ...this.charges };
		charges.push({ name: '', rate: 0, type: ChargeType.PerTherm });
		this.dataService.charges = charges;
	}

	removeCharge(index: number) {
		const charges = { ...this.charges };
		charges.splice(index, 1);
		this.dataService.charges = charges;
	}

	setCharge(
		index: number,
		name: string | undefined,
		rate: string | number | undefined,
		type: ChargeType | undefined,
	) {
		console.log('setCharge', index, name, rate, type);
		const charges = [...this.charges];

		charges[index].name = name || charges[index].name;
		charges[index].rate = Number(rate || charges[index].rate);
		charges[index].type = type || charges[index].type;

		this.dataService.charges = charges;
	}

	setUsage(index: number, value: string | number): void {
		const usage: FixedArray<number, 12> = [...this.usage] as FixedArray<
			number,
			12
		>;

		usage[index] = +value;
		this.dataService.usage = usage;
	}

	setRate(
		rate: Market,
		value: string | number | FixedArray<number, 12>,
	): void {
		const rates = { ...this.rates, [rate]: Number(value) };
		this.dataService.rates = rates;
	}
}
