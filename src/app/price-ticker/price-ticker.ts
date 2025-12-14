import { Component, ElementRef, ViewChild, AfterViewInit, signal, computed, effect, NgZone } from '@angular/core';
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
  @ViewChild('firstSet') firstSetRef!: ElementRef<HTMLDivElement>;
  
  // Base data
  stocks = signal<Stock[]>([
    { symbol: 'Barclays PLC', price: 1696.500, change: 0, changePercent: 0, high: 1705.00, low: 1689.00, prevPrice: 1696.500 },
    // { symbol: 'Barclays PLC', price: 445.400, change: 0, changePercent: 0, high: 454.55, low: 444.45, prevPrice: 445.400 },
    // { symbol: 'Apple Inc', price: 180.50, change: 1.2, changePercent: 0.67, high: 182.00, low: 179.00, prevPrice: 179.30 },
    // { symbol: 'Google', price: 135.20, change: -0.5, changePercent: -0.37, high: 136.00, low: 134.50, prevPrice: 135.70 },
  ]);

  multiplier = signal(1);
  totalDuration = signal(5); // seconds

  displayStocks = computed(() => {
    const base = this.stocks();
    const mult = this.multiplier();
    let result: Stock[] = [];
    for (let i = 0; i < mult; i++) {
        result = result.concat(base);
    }
    return result;
  });

  constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.setupResizeObserver();
  }

  setupResizeObserver() {
    // Observer on the HOST element or the parent container
    const observer = new ResizeObserver((entries) => {
      this.ngZone.run(() => {
        this.calculateLayout();
      });
    });
    
    // We observe the host element to trigger recalcs on resize
    observer.observe(this.elementRef.nativeElement);
    
    // Initial Calc
    setTimeout(() => this.calculateLayout(), 0);
  }

  calculateLayout() {
    if (!this.firstSetRef) return;

    const containerWidth = this.elementRef.nativeElement.offsetWidth;
    const firstSetEl = this.firstSetRef.nativeElement;
    
    // Check width of current content (based on current multiplier)
    const currentContentWidth = firstSetEl.offsetWidth;
    
    if (currentContentWidth === 0) return; // Not visible yet

    // Calculate the width of a single "original" set (approx)
    // We assume currentContentWidth is roughly multiplier * singleSetWidth.
    // However, we want to know if currentContentWidth is enough.
    // We need currentContentWidth >= containerWidth.
    // To match "never ending" comfortably and avoid gaps during the transition:
    // The animation moves by -currentContentWidth (Set 1 width).
    // The total view is Set 1 + Set 2.
    // When Set 1 moves completely out, Set 2 is exactly in place.
    // Gap happens if moving part is narrower than screen? NO.
    // Gap happens if total width of content rendered < screen width? 
    // Yes, if Set 2 ends before screen logic.
    // Actually, we just need Set 1 width > Container Width.
    // If Set 1 width > Container Width, then when we scroll 100% of Set 1, 
    // we have always covered the screen (assuming Set 2 follows immediately).
    
    const singleSetWidth = currentContentWidth / this.multiplier(); 
    // singleSetWidth might be 0 if stocks is empty?
    if (singleSetWidth === 0) return;

    // We want Total Width of displayStocks >= containerWidth + some buffer
    const neededMultiplier = Math.ceil(containerWidth / singleSetWidth) + 1; // +1 for safety

    if (neededMultiplier !== this.multiplier()) {
        this.multiplier.set(neededMultiplier);
    }

    // Adjust Speed
    // Constant speed = X pixels / second.
    // Let's say we want 100px / second.
    const speed = 100;
    // The animation distance is the width of ONE SET (which is now `neededMultiplier * singleSetWidth`).
    // Because we animate translateX(-50%) of the Wrapper which holds TWO sets.
    // Wait, -50% of (Set1 + Set2) = -Width(Set1).
    // So distance = currentContentWidth (after update).
    // We need to estimate the NEW width.
    const expectedWidth = neededMultiplier * singleSetWidth;
    
    // Duration = Distance / Speed
    const duration = expectedWidth / speed;
    
    // Update duration
    this.totalDuration.set(duration);
  }

  getTrend(stock: Stock): 'up' | 'down' | 'neutral' {
    if (stock.price > stock.prevPrice) return 'up';
    if (stock.price < stock.prevPrice) return 'down';
    return 'neutral';
  }
}
