import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { loadModules } from 'esri-loader/dist/esm/modules';
import { DragableService } from 'src/app/services/dragable.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-xy',
  templateUrl: './xy.component.html',
  styleUrls: ['./xy.component.css']
})
export class XyComponent implements OnInit {
  @Input() MapData: any = {};
  @Input() dssLayerTool: any;
  PariveshGIS: any = {};
  inputLat: number = 0;
  inputLong: number = 0;


  inputTypeControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  matcher = new MyErrorStateMatcher();

  constructor(private dragable: DragableService) { }
  xyShow: boolean = false;
  xyIcon(idName: any) {
    this.xyShow = !this.xyShow;
    this.dragable.registerDragElement(idName);
  }
  async ngOnInit() {
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }

  async drawXYPoint() {
    if (this.inputLat > 0 && this.inputLong > 0) {
      const [Graphic, Point, PopupTemplate] = await loadModules(["esri/Graphic", "esri/geometry/Point", "esri/PopupTemplate"]);
      const _pnt = new Point({
        latitude: this.inputLat,
        longitude: this.inputLong
      });
      const markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      };

      const _pointGraphic = new Graphic({
        geometry: _pnt, // Add the geometry created in step 4
        symbol: markerSymbol, // Add the symbol created in step 5
        attributes: { Latitude: this.inputLat, Longitude: this.inputLong }, // Add the attributes created in step 6
        popupTemplate: {
          title: "Map Point",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "Latitude"
                },
                {
                  fieldName: "Longitude"
                },
              ]
            }
          ]
        }
      });
      this.PariveshGIS.ArcView.graphics.removeAll();
      // Add the graphic to the view's default graphics view
      this.PariveshGIS.ArcView.graphics.add(_pointGraphic);
      this.PariveshGIS.ArcView.goTo({
        target: _pnt,
        zoom: 12
      });
      this.PariveshGIS.ArcView.popup.open({
        features: [_pointGraphic],
        location: _pnt
      });
    }
  }
}
