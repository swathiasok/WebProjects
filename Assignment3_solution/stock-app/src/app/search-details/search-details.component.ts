<<<<<<< HEAD
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, NgForm } from '@angular/forms';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { StockAppService } from '../stock-app.service';
import * as Highcharts from 'highcharts';
import StockModule from 'highcharts/modules/stock';
import { LocalStorageService } from '../local-storage.service';
import {
  switchMap,
  tap,
  map,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';

let indicators = require('highcharts/indicators/indicators');
let vbp = require('highcharts/indicators/volume-by-price');

indicators(Highcharts);
vbp(Highcharts);
StockModule(Highcharts);
=======
import { Component } from '@angular/core';
>>>>>>> parent of fd39339 (Assignment 3 progress)

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css'],
})
<<<<<<< HEAD
export class SearchDetailsComponent implements OnInit {
  @Output() symbolSelected = new EventEmitter<string>();
  searchControl = new FormControl();
  showContainer: boolean = true;
  options$: Observable<any[]>;
  isLoadingOptions = false;
  showSearchDetails = false;
  showAlert: any;
  symbol: string;
  companyProfileData: any;
  quoteData: any;
  companyPeers: any;
  companyNews: any;
  chartsData: any;
  hourlyChartsData: any;
  insiderSentiments: any;
  starFilled = false;
  walletMoney: number;
  currentQuantity: number = 0;
  quantity: number = 0;
  showInvalidAlert: any;
  marketStatus: number = 1;
  url: string;
  showSpinner: boolean = false;
  showSellButton: boolean;
  currentPath: string;
  optionSelected: string;

  searchData: any;
  quoteDataSubscription: Subscription | undefined;

  recommendationCharts: typeof Highcharts;
  recommendationChartOptions: Highcharts.Options = {};

  estimateCharts: typeof Highcharts;
  estimateChartOptions: Highcharts.Options = {};

  SMACharts: typeof Highcharts;
  SMAChartOptions: Highcharts.Options = {};

  hourlyCharts: typeof Highcharts;
  hourlyChartOptions: Highcharts.Options = {};
  insightsData: any;

  constructor(
    private stockService: StockAppService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  open(content: any) {
    this.quantity = 0;
    this.modalService.open(content, {
      windowClass: 'modal-top-center',
    });
  }

  openNews(content: any) {
    this.quantity = 0;
    this.modalService.open(content, {
      windowClass: 'modal-top-center',
    });
  }

  encodeURLComponent(component: string): string {
    return encodeURIComponent(component);
  }

  clearForm(searchForm: NgForm): void {
    this.searchControl.reset();
    searchForm.resetForm();
    this.showAlert = false;
    this.showInvalidAlert = false;
    this.showContainer = false;
  }

  PeerSearch(peer: string): void {
    this.router.navigate(['/search', peer]);
  }

  setDatafromLocal(storedData: {
    starFilled: boolean;
    companyData: any;
    quoteData: any;
    peersData: any;
    news: any;
    chartsData: any;
    hourlyChartsData: any;
    companyInsights: { insiderSentiments: any };
  }) {
    this.companyProfileData = storedData.companyData;
    this.quoteData = storedData.quoteData;
    this.companyPeers = storedData.peersData;
    this.companyNews = storedData.news;
    this.chartsData = storedData.chartsData;
    this.hourlyChartsData = storedData.hourlyChartsData;
    this.insightsData = storedData.companyInsights;
    this.insiderSentiments = storedData.companyInsights.insiderSentiments;
    this.showSpinner = false;
    this.calculateMarketStatus(this.quoteData);
    this.buildHourlyChart();
    this.buildChart();
    this.buildRecommendationTrends(this.insightsData);
    this.buildEPSSurprises(this.insightsData);
  }

  onSelectOption(option: any): void {
    this.showSpinner = true;
    this.router.navigate(['/search', option.symbol]);
    this.showSearchDetails = true;
  }

  searchClick(option: any) {
    this.onSelectOption(option);
  }

  updateSearchControl(symbol: string): void {
    this.searchControl.setValue(symbol);
  }

  isHomeRoute(): boolean {
    return this.route.snapshot.url.join('/') === 'search/home';
  }

  ngOnInit(): void {
    this.options$ = this.searchControl.valueChanges.pipe(
      tap(() => (this.isLoadingOptions = true)),
      debounceTime(100),
      distinctUntilChanged(),
      switchMap((query) => {
        if (!query) {
          this.isLoadingOptions = false;
          return of([]);
        }
        return this.stockService.lookupSymbol(query).pipe(
          tap((data) => {
            console.log(data['result']);
          }),
          map((data) =>
            data['result']
              .filter((item: any) => !item.symbol.includes('.'))
              .map((item: any) => ({
                symbol: item.symbol,
                description: item.description,
              }))
          ),
          tap((results) => {
            console.log(results);
            if (results.length == 0) {
              this.showInvalidAlert = true;
            } else {
              this.showInvalidAlert = false;
            }
            this.isLoadingOptions = false;
            this.showContainer = results.length > 0;
            this.stockService.setSearchcontainer(this.showContainer);
          })
        );
      })
    );

    this.route.paramMap.subscribe((params) => {
      this.symbol = params.get('ticker');
      console.log(this.showSpinner);

      if (this.symbol != 'home') {
        this.stockService.setSymbol(this.symbol);
        console.log('heree');

        if (this.symbol) {
          if (this.localStorageService.getItem() == this.symbol) {
            const storedData = this.localStorageService.getData();
            this.setDatafromLocal(storedData);
            this.optionSelected = this.symbol;
            this.searchControl.setValue(this.symbol);
          } else {
            this.searchSymbol(this.symbol);
          }
          this.optionSelected = this.symbol;
          this.localStorageService.setItem(this.symbol);
          this.getWalletMoneyFromMongoDB();
          this.setQuantity(this.symbol);
          this.checkIfTickerInWatchlist(this.symbol);
        }
      }
    });
    this.stockService.getSearchcontainer().subscribe((show) => {
      this.showContainer = show;
    });
  }

  searchSymbol(option: any): void {
    setInterval(() => {
      this.stockService.getCompanyData(option).subscribe((data) => {
        this.quoteData = data.quotesData;
        this.calculateMarketStatus(this.quoteData);
      });
    }, 15000);

    const companyData$ = this.stockService.getCompanyData(option);
    const companyNews$ = this.stockService.getCompanyNews(option);
    const hourlyChartsData$ = this.stockService.getHourlyChartsData(option);
    const chartsData$ = this.stockService.getChartsData(option);
    const companyInsights$ = this.stockService.getCompanyInsights(option);

    forkJoin({
      companyData: companyData$,
      companyNews: companyNews$,
      hourlyChartsData: hourlyChartsData$,
      chartsData: chartsData$,
      companyInsights: companyInsights$,
    }).subscribe({
      next: (data: any) => {
        console.log(data);

        this.quoteData = data.companyData.quotesData;
        this.companyProfileData = data.companyData.companyProfileData;
        this.companyPeers = data.companyData.peersData;
        this.companyNews = data.companyNews;
        this.hourlyChartsData = data.hourlyChartsData;
        this.chartsData = data.chartsData;
        this.insightsData = data.companyInsights;
        this.insiderSentiments = data.companyInsights.insiderSentiments;

        // Store all data in local storage
        this.localStorageService.saveData({
          companyData: this.companyProfileData,
          quoteData: this.quoteData,
          peersData: this.companyPeers,
          news: this.companyNews,
          chartsData: this.chartsData,
          hourlyChartsData: this.hourlyChartsData,
          companyInsights: this.insightsData,
        });
        this.calculateMarketStatus(this.quoteData);
        this.buildHourlyChart();
        this.buildChart();
        this.buildRecommendationTrends(this.insightsData);
        this.buildEPSSurprises(this.insightsData);

        this.showSpinner = false;
      },
      error: (error: any) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  calculateMarketStatus(quoteData: { t: number }) {
    const currentTime = new Date().getTime();
    const differenceInMs = currentTime - quoteData.t * 1000;

    if (differenceInMs > 300000) {
      this.marketStatus = 0;
    } else {
      this.marketStatus = 1;
    }
  }

  setQuantity(option: string) {
    this.stockService.selectOneStockData(option).subscribe((data) => {
      if (data && data.quantity) {
        this.currentQuantity = data.quantity;
      } else {
        this.currentQuantity = 0;
      }
    });
  }

  buildRecommendationTrends(data: any) {
    this.recommendationCharts = Highcharts;
    const seriesData = [
      { name: 'Strong Buy', key: 'strongBuy', color: '#197940' },
      { name: 'Buy', key: 'buy', color: '#1ec160' },
      { name: 'Hold', key: 'hold', color: '#c3951f' },
      { name: 'Sell', key: 'sell', color: '#ec686a' },
      { name: 'Strong Sell', key: 'strongSell', color: '#8b3737' },
    ];

    this.recommendationChartOptions = {
      chart: {
        type: 'column',
        backgroundColor: '#f8f8f8',
      },
      title: {
        text: 'Recommendation Trends',
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
      },
      xAxis: {
        categories: data.recommendationsData.map((item: any) =>
          item.period.slice(0, 7)
        ),
      },
      yAxis: {
        title: {
          text: '#Analysis',
          textAlign: 'center',
        },
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
          },
        },
        series: {
          stacking: 'normal',
        },
      },
      credits: {
        enabled: false,
      },
      series: [],
    };

    seriesData.forEach((series) => {
      this.recommendationChartOptions.series.push({
        name: series.name,
        type: 'column',
        data: data.recommendationsData.map((item: any) => item[series.key]),
        color: series.color,
      });
    });
  }

  buildEPSSurprises(data: any) {
    this.estimateCharts = Highcharts;
    this.estimateChartOptions = {
      chart: {
        type: 'spline',
        backgroundColor: '#f8f8f8',
      },
      title: {
        text: 'Historical EPS Surprises',
      },
      xAxis: {
        categories: data.earningsData.map(
          (item: { period: any; surprise: any }) =>
            `${item.period} <br> Surprise: ${item.surprise}`
        ),
        labels: {
          style: {
            fontSize: '12px',
            whiteSpace: 'normal',
          },
        },
      },
      yAxis: {
        title: {
          text: 'Quaterly EPS',
          textAlign: 'center',
        },
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      },
      series: [
        {
          name: 'Actual',
          type: 'spline',
          data: data.earningsData.map((item: { actual: any }) => item.actual),
        },
        {
          name: 'Estimate',
          type: 'spline',
          data: data.earningsData.map(
            (item: { estimate: any }) => item.estimate
          ),
        },
      ],
    };
  }

  buildHourlyChart() {
    this.hourlyCharts = Highcharts;
    let data = this.hourlyChartsData;
    let chartColor = data.chartColor;

    const time = data.time.map((epochTime: number) => {
      const date = new Date(epochTime);
      let pdtHours = date.getUTCHours() - 7;
      pdtHours = (pdtHours + 24) % 24;
      const formattedTime = `${pdtHours < 10 ? '0' + pdtHours : pdtHours}:00`;
      return formattedTime;
    });

    this.hourlyChartOptions = {
      chart: {
        backgroundColor: '#f8f8f8',
      },
      title: {
        text: `${data.ticker} Hourly Price Variation`,
        style: {
          color: '#9d9d9d',
          fontSize: '1rem',
        },
      },
      xAxis: {
        categories: time,
        tickInterval: Math.ceil(time.length / 6),
      },
      yAxis: [
        {
          title: {
            text: '',
          },
          opposite: true,
        },
      ],
      plotOptions: {
        series: {
          color: chartColor,
        },
      },
      series: [
        {
          type: 'line',
          data: data.stocks,
          marker: {
            enabled: false,
          },
          showInLegend: false,
        },
      ],
    };
  }

  buildChart() {
    this.SMACharts = Highcharts;
    let data = this.chartsData;

    console.log(data);

    this.SMAChartOptions = {
      chart: {
        type: 'stockChart',
        backgroundColor: '#f8f8f8',
      },
      navigator: {
        enabled: true,
      },
      rangeSelector: {
        enabled: true,
        selected: 2,
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
      },
      title: {
        text: `${data.ticker} Historical`,
      },

      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },

      xAxis: {
        type: 'datetime',
        ordinal: true,
      },

      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,

          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
          tickAmount: 3,
          opposite: true,
        },
        {
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
          tickAmount: 3,
          opposite: true,
        },
      ],

      tooltip: {
        split: true,
      },

      series: [
        {
          type: 'candlestick',
          name: 'AAPL',
          id: 'aapl',
          data: data.ohlc,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: data.volume,
          yAxis: 1,
          grouping: false,
        },
        {
          type: 'vbp',
          linkedTo: 'aapl',
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: 'aapl',
          marker: {
            enabled: false,
          },
        },
      ],
    };
  }

  toggleStar() {
    this.starFilled = !this.starFilled;
    if (this.starFilled) {
      this.insertTickerIntoMongoDB();
      this.localStorageService.saveData({ starFilled: true });
      this.showAlert = {
        message: this.companyProfileData.ticker + ' added to Watchlist.',
        type: 'success',
      };
      setTimeout(() => {
        this.showAlert = null;
      }, 5000);
    } else {
      this.removeTickerFromMongoDB(this.companyProfileData.ticker);
      this.showAlert = {
        message: this.companyProfileData.ticker + ' removed from Watchlist.',
        type: 'danger',
      };
      setTimeout(() => {
        this.showAlert = null;
      }, 5000);
    }
  }

  checkIfTickerInWatchlist(ticker: string) {
    this.stockService.selectData().subscribe((data) => {
      const isInWatchlist = data.some(
        (item: { symbol: any }) => item.symbol === ticker
      );
      this.starFilled = isInWatchlist;
    });
  }

  insertTickerIntoMongoDB() {
    this.stockService
      .insertData(this.companyProfileData, this.quoteData)
      .subscribe((data) => {});
  }

  removeTickerFromMongoDB(ticker: string) {
    this.stockService.removeData(ticker).subscribe((data) => {});
  }

  getWalletMoneyFromMongoDB() {
    this.stockService.getWalletMoney().subscribe((data) => {
      this.walletMoney = data.wallet.toFixed(2);
    });
  }

  calculateTotal(): number {
    const total = this.quantity * this.quoteData.c;
    return total;
  }

  isBuy(): boolean {
    if (this.calculateTotal() > this.walletMoney || this.quantity === 0) {
      return true;
    }
    return false;
  }

  buyStock() {
    const total = this.calculateTotal();
    this.stockService
      .insertStockData(
        this.companyProfileData.ticker,
        this.companyProfileData.name,
        this.quoteData.c,
        this.quantity,
        total,
        'buy'
      )
      .subscribe((data) => {
        this.showAlert = {
          message: this.companyProfileData.ticker + ' bought successfully.',
          type: 'success',
        };
        this.showSellButton = true;

        setTimeout(() => {
          this.showAlert = null;
        }, 5000);
      });

    this.modalService.dismissAll();
  }

  isSell(): boolean {
    if (this.quantity > this.currentQuantity || this.quantity === 0) {
      return true;
    }
    return false;
  }

  sellStock(current_price: number, symbol: string, name: string) {
    const total = this.calculateTotal();
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
        if (data.delete == true) {
          this.showSellButton = false;
          this.currentQuantity = 0;
        }
        this.showAlert = {
          message: this.companyProfileData.ticker + ' sold successfully.',
          type: 'danger',
        };
        setTimeout(() => {
          this.showAlert = null;
        }, 5000);
      });

    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.quoteDataSubscription) {
      this.quoteDataSubscription.unsubscribe();
    }
  }
}
=======
export class SearchDetailsComponent {}
>>>>>>> parent of fd39339 (Assignment 3 progress)
