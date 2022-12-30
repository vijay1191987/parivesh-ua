import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-spatial-search',
  templateUrl: './spatial-search.component.html',
  styleUrls: ['./spatial-search.component.css']
})
export class SpatialSearchComponent implements OnInit {

  constructor(private dragable: DragableService) {}

  spatialSearchShow:boolean = false;
  spatialSearchIcon(idName: any)
  {
    this.spatialSearchShow = !this.spatialSearchShow;
    this.dragable.registerDragElement(idName);
  } 
  ngOnInit(): void {
  }

}
