import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bill } from '../entity/Bill';
import { ChargeType } from '../entity/ChargeType';
import { Offer } from '../entity/Offer';
import { Month, monthLabels } from '../pages/explorer/explorer.component';

@Component({
  selector: 'app-bill-total',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './bill-total.component.html',
  styleUrl: './bill-total.component.scss',
})
export class BillTotalComponent {
  readonly ChargeType = ChargeType;
  readonly MonthLabels = monthLabels;
  readonly Month = Month;

  offer = input.required<Offer>();
  bill = input.required<Bill>();
  show = input<'total' | 'dollarsPerTherm' | 'thermsPerDollar'>('total');
}