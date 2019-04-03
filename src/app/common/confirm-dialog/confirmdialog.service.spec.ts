import { TestBed } from '@angular/core/testing';

import { ConfirmdialogService } from './confirmdialog.service';

describe('ConfirmdialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfirmdialogService = TestBed.get(ConfirmdialogService);
    expect(service).toBeTruthy();
  });
});
