import { Component, OnInit, Input } from '@angular/core';
import { precisionRound, mapPointerCords } from '../gisHelper'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  mapScale: number = 0;
  mapPointer: string = '';

  //{To Access ESRI MapView object}
  @Input() ESRIObject: object = {};
  PariveshGIS: any = {};

  constructor() { }

  ngOnInit(): void {
    const t: any = this.ESRIObject;
    t.PariveshMap.then((_view: any) => {
      this.PariveshGIS = _view;
      _view.MapView.watch("scale", (value: number) => {
        this.mapScale = precisionRound(value, 0);
      });
      _view.MapView.on("pointer-move", (evt: any) => {
        this.mapPointer = mapPointerCords(_view.MapView.toMap({ x: evt.x, y: evt.y }), _view);
      });
    }).catch((error: any) => console.log(error));
  }
  zoomInOut(event: string) {
    if (event === "OUT")
      this.PariveshGIS.MapView.scale = this.mapScale * 2;
    else
      this.PariveshGIS.MapView.scale = this.mapScale * 0.5;
  }
}
