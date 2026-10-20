import { FormControl, NgControl } from '@angular/forms';
import { CurrencyMaskDirective } from './currency-mask.directive';

describe('CurrencyMaskDirective', () => {
  it('should create an instance', () => {
    const directive = new CurrencyMaskDirective({
      control: new FormControl('$0.00'),
    } as unknown as NgControl);
    expect(directive).toBeTruthy();
  });
});
