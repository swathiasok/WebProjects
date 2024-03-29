import { TestBed } from '@angular/core/testing';

import { StockAppService } from './stock-app.service';

describe('StockAppService', () => {
  let service: StockAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
