import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailModalComponent } from './project-detail-modal.component';

describe('ProjectDetailModalComponent', () => {
  let component: ProjectDetailModalComponent;
  let fixture: ComponentFixture<ProjectDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
