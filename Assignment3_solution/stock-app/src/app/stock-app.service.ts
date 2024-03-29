import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockAppService {
  searchData: any = null;
  setSymbol(symbol: string): void {
    this.searchData = symbol;
  }

  private searchcontainerSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  public searchcontainer$: Observable<boolean> =
    this.searchcontainerSubject.asObservable();

  constructor(private http: HttpClient) {}

  setSearchcontainer(container: boolean): void {
    this.searchcontainerSubject.next(container);
  }

  getSearchcontainer(): Observable<boolean> {
    return this.searchcontainer$;
  }

  lookupSymbol(query: string): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/lookup_symbol?q=${query}`);
  }

  getCompanyData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/company_data?symbol=${query}`
    );
  }

  getQuoteData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/quote_data?symbol=${query}`
    );
  }

  getHourlyChartsData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/hourly_chart_data?symbol=${query}`
    );
  }

  getChartsData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/chart_data?symbol=${query}`
    );
  }

  getCompanyNews(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/company_news?symbol=${query}`
    );
  }

  getCompanyInsights(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/company_insights?symbol=${query}`
    );
  }

  insertData(companyData: any, quoteData: any): Observable<any> {
    const queryParams = new URLSearchParams({
      companyData: JSON.stringify(companyData),
      quoteData: JSON.stringify(quoteData),
    }).toString();

    return this.http.get<any>(
      `http://localhost:3000/insert_data?${queryParams}`
    );
  }

  insertStockData(
    ticker: string,
    name: string,
    current_price: number,
    quantity: number,
    total: number,
    buyOrSell: string
  ): Observable<any> {
    const queryParams = new URLSearchParams({
      ticker: ticker,
      name: name,
      price: current_price.toString(),
      quantity: quantity.toString(),
      total: total.toString(),
      buyOrSell,
    }).toString();

    return this.http.get<any>(
      `http://localhost:3000/insert_stock_data?${queryParams}`
    );
  }

  removeData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/remove_data?symbol=${query}`
    );
  }

  selectData(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/select_data`);
  }

  selectStockData(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/select_stock_data`);
  }

  selectOneStockData(query: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:3000/select_ticker_stock_data?symbol=${query}`
    );
  }

  getWalletMoney(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/get_wallet_money`);
  }
}
