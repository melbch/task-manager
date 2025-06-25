import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverHighlight]',
  standalone: true,
})
export class HoverHighlightDirective {
  private readonly highlightColor = '#f0f0f0';

  private originalColor: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.originalColor = this.el.nativeElement.style.backgroundColor;
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.highlightColor);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.2s ease-in-out');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.originalColor);
  }
}

//used in task-card + tasks-list and project-card + projects-list components
