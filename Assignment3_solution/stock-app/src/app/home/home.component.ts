import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @Output() symbolSelected = new EventEmitter<string>();
  searchControl = new FormControl();
  showContainer: boolean = true;
  options$: Observable<any[]>;
  isLoadingOptions = false;
  showSearchDetails = false;
  showAlert: boolean = true;

  constructor(private stockService: StockAppService, private router: Router) {}

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
          map((data) =>
            data['result']
              .filter((item: any) => !item.symbol.includes('.'))
              .map((item: any) => ({
                symbol: item.symbol,
                description: item.description,
              }))
          ),
          tap((results) => {
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
}
