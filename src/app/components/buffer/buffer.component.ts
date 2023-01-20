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
  @Input() MapData: any = {};
  PariveshGIS: any = {};

  constructor(private dragable: DragableService) {
  }
  async bufferIcon(idName: any) {
    this.bufferShow = !this.bufferShow;
    this.dragable.registerDragElement(idName);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;

    console.log(this.PariveshGIS);

  }
  ngOnInit(): void {
  }
}
