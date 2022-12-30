import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
// import { sliceTimeseriesFromEnd } from '../gisHelper/gis';

@Component({
  selector: 'app-forest',
  templateUrl: './forest.component.html',
  styleUrls: ['./forest.component.css']
})
export class ForestComponent implements OnInit {

  constructor(public dragable: DragableService) { }
  
  forestShow:boolean = false;
  showDssResult:boolean = false;
  showViewResult:boolean = false;
  addexpendclass: boolean = false;
  forestIcon(idName: any)
  {
    this.forestShow = !this.forestShow; 
    this.dragable.registerDragElement(idName);
    // console.log( sliceTimeseriesFromEnd('a','b'));
  }
  ExpendScreen() {
    this.addexpendclass = !this.addexpendclass;
  } 
  dssResult()
  {
    this.showDssResult = !this.showDssResult;
  }
  
  viewResult()
  {
    this.showViewResult = !this.showViewResult;
  }


  ngOnInit(): void {
  } 

}
