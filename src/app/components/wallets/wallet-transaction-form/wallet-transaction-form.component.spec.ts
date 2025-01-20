import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTransactionFormComponent } from './wallet-transaction-form.component';

describe('WalletTransactionFormComponent', () => {
  let component: WalletTransactionFormComponent;
  let fixture: ComponentFixture<WalletTransactionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletTransactionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletTransactionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
