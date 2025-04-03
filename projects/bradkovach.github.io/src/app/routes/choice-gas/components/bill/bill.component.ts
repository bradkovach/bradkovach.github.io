import type { Bill } from '../../entity/Bill';

import { Component, input } from '@angular/core';
import { DecimalPipe, JsonPipe } from '@angular/common';

import { ChargeType } from '../../entity/ChargeType';

@Component({
    imports: [JsonPipe, DecimalPipe],
    selector: 'app-bill',
    styleUrl: './bill.component.scss',
    templateUrl: './bill.component.html'
})
export class BillComponent {
  bill = input.required<Bill>();

  readonly ChargeType = ChargeType;
}
