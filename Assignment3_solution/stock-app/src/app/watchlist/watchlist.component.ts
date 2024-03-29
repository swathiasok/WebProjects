import { Component, OnInit } from '@angular/core';
import { StockAppService } from '../stock-app.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent implements OnInit {
  watchlist: any[] = [];
  showSpinner: boolean = true;

  constructor(private stockService: StockAppService) {}

  ngOnInit(): void {
    this.showDataFromMongoDB();
  }

  showDataFromMongoDB() {
    this.stockService.selectData().subscribe((data) => {
      this.showSpinner = false;
      this.watchlist = data;
    });
  }

  removeTickerFromMongoDB(ticker: string) {
    this.stockService.removeData(ticker).subscribe((data) => {
      this.showDataFromMongoDB();
    });
  }
}
