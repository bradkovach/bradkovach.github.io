import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';

import { DataService } from '../../services/data/data.service';

@Component({
    imports: [AsyncPipe, RouterLink],
    selector: 'app-vendors',
    styleUrl: './vendors.component.scss',
    templateUrl: './vendors.component.html'
})
export class VendorsComponent {
  private readonly dataService = inject(DataService);

  vendors$ = this.dataService.vendors$;
}
