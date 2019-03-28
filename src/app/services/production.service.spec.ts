import { TestBed } from '@angular/core/testing';

import { ProductionService } from './production.service';

describe('ProductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProductionService = TestBed.get(ProductionService);
    expect(service).toBeTruthy();
  });
});
