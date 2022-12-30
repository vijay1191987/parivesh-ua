import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.css']
})
export class SwipeComponent implements OnInit {

  constructor(private dragable: DragableService) { 
  } 

  swipeShow:boolean = false;
  swipeIcon(idName: any)
  {
    this.swipeShow = !this.swipeShow;
    this.dragable.registerDragElement(idName);
  }
 
  ngOnInit(): void {
  } 
}
