import { Component, OnInit } from '@angular/core';
import { StockAppService } from '../stock-app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent implements OnInit {
  watchlist: any[] = [];
  combinedData: any[] = [];
  quoteData: any;
  showSpinner: boolean = true;

  constructor(private stockService: StockAppService, private router: Router) {}

  ngOnInit(): void {
    this.showDataFromMongoDB();
  }

  showDataFromMongoDB() {
    this.showSpinner = true;
    this.stockService.selectData().subscribe((data) => {
      this.watchlist = data;
      this.getQuoteData();
    });
  }

  removeTickerFromMongoDB(ticker: string) {
    this.stockService.removeData(ticker).subscribe((data) => {
      const index = this.combinedData.findIndex(
        (item) => item.symbol === ticker
      );
      if (index !== -1) {
        this.combinedData.splice(index, 1);
      }
    });
  }

  getQuoteData() {
    this.showSpinner = true;
    this.watchlist.forEach((wdata, index) => {
      this.stockService.getQuoteData(wdata.symbol).subscribe((data) => {
        const newData = { ...wdata, ...data };
        this.combinedData.push(newData);
      });
    });
    this.showSpinner = false;
  }

  goToSearch(symbol: string) {
    this.router.navigate(['/search', symbol]);
  }
}
