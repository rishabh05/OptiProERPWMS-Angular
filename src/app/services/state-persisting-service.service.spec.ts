import { TestBed } from '@angular/core/testing';

import { StatePersistingServiceService } from './state-persisting-service.service';

describe('StatePersistingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StatePersistingServiceService = TestBed.get(StatePersistingServiceService);
    expect(service).toBeTruthy();
  });
});
