import { Component } from '@angular/core';
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
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  clearLocalStorage(): void {
    this.localStorageService.clear();
  }

  setActiveLink(): void {
    const currentRoute = this.router.url.split('/')[1];
    if (currentRoute === 'watchlist' || currentRoute === 'portfolio') {
      this.activeLink = currentRoute;
    } else {
      this.activeLink = 'search';
    }
  }

  goToPortfolio(): void {
    this.activeLink = 'portfolio';
    this.symbol = this.localStorageService.getItem();
    if (this.symbol == null) {
      this.localStorageService.setItem(this.router.url.split('/')[2]);
    }
    this.router.navigate(['/portfolio']);
  }

  goToWatchlist(): void {
    this.activeLink = 'watchlist';
    this.symbol = this.localStorageService.getItem();
    if (this.symbol == null) {
      this.localStorageService.setItem(this.router.url.split('/')[2]);
    }

    this.router.navigate(['/watchlist']);
  }

  goToSearch(): void {
    this.activeLink = 'search';
    this.symbol = this.localStorageService.getItem();
    if (this.symbol == 'undefined') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/search', this.symbol]);
    }
  }
}
