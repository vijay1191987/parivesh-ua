import { Component, Input, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';


@Component({
  selector: 'app-buffer',
  templateUrl: './buffer.component.html',
  styleUrls: ['./buffer.component.css']
})

export class BufferComponent implements OnInit {
  dropdownList: any = [];
  selectedItems: any = [];

  bufferShow: boolean = false;
  //{To Access ESRI MapView object}
  @Input() ESRIObject: object = {};
  PariveshGIS: object = {};

  constructor(private dragable: DragableService) {
  }
  async bufferIcon(idName: any) {
    this.bufferShow = !this.bufferShow;
    this.dragable.registerDragElement(idName);
    const t: any = this.ESRIObject;
    this.PariveshGIS = await t.PariveshMap;   
  }
  ngOnInit(): void {
  }
}
