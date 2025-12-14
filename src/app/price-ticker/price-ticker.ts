import { Component, ElementRef, ViewChild, AfterViewInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  prevPrice: number; // For up/down logic
}

@Component({
  selector: 'app-price-ticker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-ticker.html',
  styleUrl: './price-ticker.css'
})
export class PriceTickerComponent implements AfterViewInit {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  
  // Base data
  stocks = signal<Stock[]>([
    { symbol: 'Barclays PLC', price: 1696.500, change: 0, changePercent: 0, high: 1705.00, low: 1689.00, prevPrice: 1696.500 },
    // { symbol: 'Barclays PLC', price: 445.400, change: 0, changePercent: 0, high: 454.55, low: 444.45, prevPrice: 445.400 },
    // { symbol: 'Apple Inc', price: 180.50, change: 1.2, changePercent: 0.67, high: 182.00, low: 179.00, prevPrice: 179.30 },
    // { symbol: 'Google', price: 135.20, change: -0.5, changePercent: -0.37, high: 136.00, low: 134.50, prevPrice: 135.70 },
  ]);

  // Duplicated data for infinite scroll
  // We will duplicate the list enough times to ensure it covers the screen width plus some buffer.
  // For simplicity in this keyframe approach, we usually just need 2 sets if the animation is 0% -> -50%.
  // Or if we animate 0 -> -100% of the *original* width, we need enough copies to fill the container + original width.
  // Let's create a computed signal that just repeats the data X times.
  // Since we don't know the width yet, standard marquee often just doubles the content.
  displayStocks = computed(() => {
    return this.stocks();
  });

  constructor() {}

  ngAfterViewInit() {
    // We can use ResizeObserver here if we want JS-based exact font sizing,
    // but we will try CSS container queries first.
  }

  getTrend(stock: Stock): 'up' | 'down' | 'neutral' {
    if (stock.price > stock.prevPrice) return 'up';
    if (stock.price < stock.prevPrice) return 'down';
    return 'neutral';
  }
}
