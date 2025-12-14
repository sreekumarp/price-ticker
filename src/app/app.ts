import { Component, signal } from '@angular/core';
import { PriceTickerComponent } from './price-ticker/price-ticker';

@Component({
  selector: 'app-root',
  imports: [PriceTickerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('price-ticker');
}
