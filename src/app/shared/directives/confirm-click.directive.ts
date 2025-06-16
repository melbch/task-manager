import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appConfirmClick]'
})
export class ConfirmClickDirective {
  @Input() confirmMessage = 'Are you sure?';
  @Input() appConfirmClick!: () => void;

  @HostListener('click', ['$event'])
  confirmFirst(event: Event) {
    event.preventDefault();

    if (confirm(this.confirmMessage)) {
      this.appConfirmClick();
    }
  }
}
