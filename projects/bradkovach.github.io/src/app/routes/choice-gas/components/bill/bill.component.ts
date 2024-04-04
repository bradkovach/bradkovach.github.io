import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Bill } from '../../entity/Bill';
import { ChargeType } from '../../entity/ChargeType';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [JsonPipe, DecimalPipe],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss',
})
export class BillComponent {
  bill = input.required<Bill>();

  readonly ChargeType = ChargeType;
}
