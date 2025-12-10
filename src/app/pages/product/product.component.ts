import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-page',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductPageComponent {
  id: string | null;
  constructor(route: ActivatedRoute) {
    this.id = route.snapshot.paramMap.get('id');
  }
}
