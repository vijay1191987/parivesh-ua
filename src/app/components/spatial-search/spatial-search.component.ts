import { Component, Input, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { fetchDataEsriService} from "./../gisHelper";
import { TableComponent } from 'src/app/commonComponents/table/table.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
@Component({
  selector: 'app-spatial-search',
  templateUrl: './spatial-search.component.html',
  styleUrls: ['./spatial-search.component.css']
})
export class SpatialSearchComponent implements OnInit {
  @Input() MapData: any = {};
  decisionLayers: any[] = [];
  selectedItems_Decision: any = [];
  sketchViewModel: any = null;
  sketchLayer: any = null;
  PariveshGIS: any = {};
  _spatialSearchResults: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true
  };

  sketchGeometry: any = null;

  constructor(private dragable: DragableService, private parivesh: PariveshServices,private bottomSheet: MatBottomSheet) {
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      const dl: any[] = layerData.filter((element: any) => element.decision_layer == true);
      for (let index = 0; index < dl.length; index++) {
        this.decisionLayers.push({ item_id: dl[index].ggllayerid, item_text: dl[index].layernm, item_url: dl[index].layerurl });
      }
    });
  }

  spatialSearchShow: boolean = false;
  async spatialSearchIcon(idName: any) {
    this.spatialSearchShow = !this.spatialSearchShow;
    this.dragable.registerDragElement(idName);

    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }
  ngOnInit(): void {
  }
  onSelectAll(items: any) {
    this.selectedItems_Decision = [];
    if (items.length === 0)
      this.selectedItems_Decision = [];
    items.forEach((element: any) => {
      this.selectedItems_Decision.push(element.item_id);
    });

  }

  onItemDeSelect(data: any) {
    this.selectedItems_Decision.forEach((element: any, i: any) => {
      const jsonKey = Object.keys(element);
      if (data.item_id === parseInt(jsonKey[0]))
        this.selectedItems_Decision.splice(i, 1);
    });
  }


  async geometryButtonsClickHandler(evt: any, data: any) {
    const [GraphicsLayer, SketchViewModel] = await loadModules(["esri/layers/GraphicsLayer", "esri/widgets/Sketch/SketchViewModel",]);
    this.sketchLayer = new GraphicsLayer();
    this.sketchViewModel = new SketchViewModel({
      layer: this.sketchLayer,
      view: this.PariveshGIS.ArcView,
      pointSymbol: {
        type: 'simple-marker',
        color: [255, 255, 255, 0],
        size: '1px',
        outline: {
          color: 'gray',
          width: 0
        }
      }
    });

    this.sketchViewModel.create(data);
    this.sketchViewModel.on(["create"], (event: any) => {
      // update the filter every time the user finishes drawing the filtergeometry
      if (event.state == "complete") {
        this.sketchGeometry = event.graphic.geometry;
      }
    });

    this.sketchViewModel.on(["update"], (event: any) => {
      const eventInfo = event.toolEventInfo;
      // update the filter every time the user moves the filtergeometry
      if (event.toolEventInfo && event.toolEventInfo.type.includes("stop")) {
        this.sketchGeometry = event.graphics[0].geometry;
      }
    });
    this.PariveshGIS.ArcMap.add(this.sketchLayer);
  }


  async spatialSearchExecution() {
    const [FeatureLayer,Query] = await loadModules(["esri/layers/FeatureLayer","esri/rest/support/Query"]);
    // check decision layer
    for (let index = 0; index < this.selectedItems_Decision.length; index++) {
      const dt = this.decisionLayers.filter((element) => element.item_id == this.selectedItems_Decision[index].item_id);
      let layer_ID = dt[0].item_url.split('/').pop();
      const featUrl = !isNaN(layer_ID) ? dt[0].item_url.trim() : dt[0].item_url.trim() + '/' + this.selectedItems_Decision[index].item_id;

      const q = new Query();
      q.returnGeometry = false;
      q.outFields = ["*"];
      q.geometry = this.sketchGeometry;
      q.outSpatialReference = { wkid: 4326 };

      const _lyr = new FeatureLayer({
        id: this.selectedItems_Decision[index].item_text,
        url: featUrl,
        apiKey: Bharatmaps,
        visible: false
      });
      const response = await fetchDataEsriService(q, _lyr);
      const _json = { TargetLayer: this.selectedItems_Decision[index].item_text, Results: response.features, tabEnable: true };
      this._spatialSearchResults.push(_json);
    }
    if (this._spatialSearchResults.length > 0) {
      this.bottomSheet.dismiss();
      this.bottomSheet.open(TableComponent, {
        data: { rowData: this._spatialSearchResults, pariveshGIS: this.PariveshGIS },
        hasBackdrop: false,
        closeOnNavigation: false,
        disableClose: true,
      });
    }
    else {
      this.bottomSheet.dismiss();
    }

  }
}
