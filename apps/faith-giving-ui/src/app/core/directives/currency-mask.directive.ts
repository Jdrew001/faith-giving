import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: "[formControlName][currencyMask]"
})
export class CurrencyMaskDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    const inputValue = event.target.value;

    // Remove non-digits from the input value
    const cleanValue = inputValue.replace(/[^0-9]/g, '');

    // Set default value as '0' if the input is empty or not a valid number
    const defaultValue = '0';

    // Disable backspace when the input is set to the default value
    if (inputValue === `$${defaultValue}.00` && event.inputType === 'deleteContentBackward') {
      event.preventDefault();
      return;
    }

    // Calculate the decimal value
    const decimalValue = cleanValue.slice(-2);

    // Calculate the integer value without leading zeros
    const integerValue = cleanValue.slice(0, -2);

    // Format the integer value with commas
    const formattedIntegerValue = integerValue ? parseInt(integerValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

    // Determine the formatted value
    let formattedValue = '';

    if (formattedIntegerValue.length > 0) {
      formattedValue = `$${formattedIntegerValue}.${decimalValue.padStart(2, '0')}`;
    } else if (decimalValue.length > 0) {
      formattedValue = `$${defaultValue}.${decimalValue.padStart(2, '0')}`;
    } else {
      formattedValue = `$${defaultValue}.00`;
    }

    this.ngControl.control.patchValue(formattedValue);
  }

  private formatAsCurrency(value: string): string {
    // Add commas for thousands separator
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Concatenate the parts and add decimal places
    const formattedValue = parts.join('.');
    return formattedValue;
  }
}
