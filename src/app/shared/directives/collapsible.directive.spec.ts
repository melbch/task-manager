import { ElementRef } from "@angular/core";
import { CollapsibleDirective } from "./collapsible.directive";

describe('CollapsibleDirective', () => {
  let directive: CollapsibleDirective;

  beforeEach(() => {
    //create a mock ElementRef with a nativeElement stub
    const mockElementRef = {
      nativeElement: document.createElement('div')
    } as ElementRef;

    directive = new CollapsibleDirective(mockElementRef);
  })
  
  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
