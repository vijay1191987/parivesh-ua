import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-xy',
  templateUrl: './xy.component.html',
  styleUrls: ['./xy.component.css']
})
export class XyComponent implements OnInit {

  constructor(private dragable: DragableService) { }

  
  xyShow:boolean = false;
  xyIcon(idName: any)
  {
    this.xyShow = !this.xyShow;
    this.dragable.registerDragElement(idName);
  } 

  ngOnInit(): void {
  }

}
