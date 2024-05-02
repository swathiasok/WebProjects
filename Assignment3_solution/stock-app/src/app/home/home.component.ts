<<<<<<< HEAD
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { StockAppService } from '../stock-app.service';
import {
  switchMap,
  tap,
  map,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
=======
import { Component } from '@angular/core';
>>>>>>> parent of fd39339 (Assignment 3 progress)

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
<<<<<<< HEAD
export class HomeComponent implements OnInit {
  @Output() symbolSelected = new EventEmitter<string>();
  searchControl = new FormControl();
  showContainer: boolean = true;
  options$: Observable<any[]>;
  isLoadingOptions = false;
  showSearchDetails = false;
  showAlert: boolean = false;
  search: string = 'Enter stock ticker symbol ';

  constructor(
    private stockService: StockAppService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
              this.showAlert = true;
            } else {
              this.showAlert = false;
            }
            this.isLoadingOptions = false;
            this.showContainer = results.length > 0;
            this.stockService.setSearchcontainer(this.showContainer);
          })
        );
      })
    );
  }

  clearForm(searchForm: NgForm): void {
    this.searchControl.reset();
    searchForm.resetForm();
    this.showAlert = false;
    this.stockService.setSearchcontainer(false);
    this.router.navigate(['/search/home']);
  }

  onSelectOption(option: any): void {
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
}
=======
export class HomeComponent {}
>>>>>>> parent of fd39339 (Assignment 3 progress)
