import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoardColumnComponent } from './task-board-column.component';

describe('TaskBoardColumnComponent', () => {
  let component: TaskBoardColumnComponent;
  let fixture: ComponentFixture<TaskBoardColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoardColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskBoardColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
