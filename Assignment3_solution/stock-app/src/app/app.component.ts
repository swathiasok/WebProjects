import { Component } from '@angular/core';
import { StockAppService } from './stock-app.service';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'stock-app';
  isNavbarCollapsed = true;
  symbol: string;
  activeLink: string = 'search';

  constructor(
    private stockService: StockAppService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  clearLocalStorage(): void {
    this.localStorageService.clear();
  }

  goToPortfolio(): void {
    this.activeLink = 'portfolio';
    this.localStorageService.setItem(this.router.url.split('/')[2]);
    this.router.navigate(['/portfolio']);
  }

  goToWatchlist(): void {
    this.activeLink = 'watchlist';
    this.localStorageService.setItem(this.router.url.split('/')[2]);
    this.router.navigate(['/watchlist']);
  }

  goToSearch(): void {
    this.activeLink = 'search';
    this.symbol = this.localStorageService.getItem();
    console.log(this.symbol);

    this.router.navigate(['/search', this.symbol]);
  }
}
