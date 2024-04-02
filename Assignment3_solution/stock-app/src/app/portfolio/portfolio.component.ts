import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StockAppService } from '../stock-app.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit {
  quoteData: any;
  walletMoney: number;
  quantity: number = 0;
  stocks: any[] = [];
  showAlert: any = null;
  showSpinner: boolean = true;

  constructor(
    private stockService: StockAppService,
    private buyModalService: NgbModal,
    private sellModalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.showSpinner = true;
    this.getWalletMoneyFromMongoDB();
  }

  showStockData(
    symbol: string = '',
    alert: boolean = false,
    message: string = '',
    messageType: string = ''
  ) {
    try {
      this.stockService.selectStockData().subscribe((data) => {
        this.stocks = data;
        let completedRequests = 0;
        for (let i = 0; i < data.length; i++) {
          this.stockService
            .getQuoteData(this.stocks[i].symbol)
            .subscribe((data) => {
              this.stocks[i].current_price = data.quotesData.c;
              completedRequests++;

              if (completedRequests === this.stocks.length && alert) {
                this.showAlert = {
                  message: symbol + ' ' + message,
                  type: messageType,
                };
                setTimeout(() => {
                  this.showAlert = null;
                }, 5000);
              }
            });
        }
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      this.showSpinner = false;
    }
  }

  openBuy(content: any) {
    this.quantity = 0;
    this.buyModalService.open(content, {
      windowClass: 'modal-top-center',
    });
  }

  openSell(content: any) {
    this.quantity = 0;
    this.sellModalService.open(content, {
      windowClass: 'modal-top-center',
    });
  }

  calculateTotal(current_price: number): number {
    const total = this.quantity * current_price;
    return total;
  }

  isBuy(current_price: number): boolean {
    if (
      this.calculateTotal(current_price) > this.walletMoney ||
      this.quantity === 0
    ) {
      return true;
    }
    return false;
  }

  buyStock(current_price: number, symbol: string, name: string) {
    const total = this.calculateTotal(current_price);
    this.stockService
      .insertStockData(symbol, name, current_price, this.quantity, total, 'buy')
      .subscribe((data) => {
        this.showStockData(symbol, true, 'bought successfully.', 'success');
      });
    this.buyModalService.dismissAll();
  }

  isSell(currentQuantity: number): boolean {
    if (this.quantity > currentQuantity || this.quantity === 0) {
      return true;
    }
    return false;
  }

  sellStock(current_price: number, symbol: string, name: string) {
    const total = this.calculateTotal(current_price);
    this.stockService
      .insertStockData(
        symbol,
        name,
        current_price,
        this.quantity,
        total,
        'sell'
      )
      .subscribe((data) => {
        this.showStockData(symbol, true, 'sold successfully.', 'danger');
      });
    this.sellModalService.dismissAll();
  }

  getWalletMoneyFromMongoDB() {
    this.stockService.getWalletMoney().subscribe((data) => {
      this.walletMoney = data.wallet.toFixed(2);
      this.showStockData();
    });
  }
}
