import { TestBed } from '@angular/core/testing';

import { SignalR } from './signalr';

describe('Signalr', () => {
  let service: SignalR;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalR);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
