import { Component, OnInit,Input } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { loadModules } from 'esri-loader'


let screenshotImage: any = {};
let context: any = {};
let screenshottst: any = window.navigator;
@Component({
  selector: 'app-screen-shot',
  templateUrl: './screen-shot.component.html',
  styleUrls: ['./screen-shot.component.css']
})
export class ScreenShotComponent implements OnInit {

  @Input() MapData: any = {};
  PariveshGIS: any = {};
  isModalOpen: boolean = false;
  ESRIObject: object = {};
  ESRIObj_: any = null;
  xyShow: boolean = false;
  screenshotShow: boolean = false;


  constructor(private dragable: DragableService) {}

  async ngOnInit() {
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }





  screenshotIcon(idName: any)
  {
    this.screenshotShow = !this.screenshotShow;
    this.dragable.registerDragElement(idName);
  }


}
