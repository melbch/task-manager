import { Directive, ElementRef, Host, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCollapsible]'
})
export class CollapsibleDirective {
  @Input() collapsed = false;

  @HostBinding('attr.aria-expanded') get ariaExpanded() {
    return !this.collapsed;
  }

  @HostBinding('class.collapsed') get isCollapsed() {
    return this.collapsed;
  }

  constructor(private el: ElementRef) { 
    this.el.nativeElement.setAttribute('role', 'button');
    this.el.nativeElement.setAttribute('tabindex', '0');
  }

  @HostListener('click')
  toggle() {
    this.collapsed = !this.collapsed;
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  toggleOnKey() {
    this.toggle();
  }

}
