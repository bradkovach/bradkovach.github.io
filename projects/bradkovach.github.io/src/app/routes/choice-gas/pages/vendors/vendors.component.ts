import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { vendors } from '../../data/vendors';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss',
})
export class VendorsComponent {
  vendors$ = of(vendors);
}
