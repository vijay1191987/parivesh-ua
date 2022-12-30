import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.css']
})
export class MeasureComponent implements OnInit {

  constructor(private dragable: DragableService) { }

  
  elevationShow:boolean = false;
  elevationIcon(idName: any)
  {
    this.elevationShow = !this.elevationShow;
    this.dragable.registerDragElement(idName);
  } 

  ngOnInit(): void {
  }

}
