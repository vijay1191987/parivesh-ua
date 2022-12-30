import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit {

  constructor(private dragable: DragableService) {}

  printShow:boolean = false;
  printIcon(idName: any)
  {
    this.printShow = !this.printShow;
    this.dragable.registerDragElement(idName);
  } 

  ngOnInit(): void {
  }

}
