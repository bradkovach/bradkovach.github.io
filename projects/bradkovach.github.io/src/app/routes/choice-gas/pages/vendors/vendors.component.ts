import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss',
})
export class VendorsComponent {
  private readonly dataService = inject(DataService);

  vendors$ = this.dataService.vendors$;
}
