import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-screen-shot',
  templateUrl: './screen-shot.component.html',
  styleUrls: ['./screen-shot.component.css']
})
export class ScreenShotComponent implements OnInit {

  constructor(private dragable: DragableService) {}

  screenshotShow:boolean = false;
  screenshotIcon(idName: any)
  {
    this.screenshotShow = !this.screenshotShow;
    this.dragable.registerDragElement(idName);
  } 
  ngOnInit(): void {
    
  }

}
