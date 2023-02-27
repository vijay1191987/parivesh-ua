import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { changeBaseMap } from 'src/app/ESRIMAP';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.css']
})
export class SwipeComponent implements OnInit {
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  decisionLayers: any[] = [];
  swipeShow: boolean = false;
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true
  };

  trailingdata = [
    { item_id: "Bing", item_text: "Bing Map" },
    { item_id: "NIC_Street", item_text: "NIC Street" },
    { item_id: "NSatellite", item_text: "NIC Satellite" },
    { item_id: "gStreet", item_text: "Google Street" },
    { item_id: "gSatellite", item_text: "Google Satellite" },
    { item_id: "Terrain", item_text: "Terrain" },
    { item_id: "Topo", item_text: "Topo" },
    { item_id: "ESatellite", item_text: "Esri Satellite" }

  ];

  selectedItems_Decision: any = [];
  selectedTrailing_Layer: any = [];
  swipeTool: any;
  _leadinglayer: any = {};
  _tailinglayerObj: any = {};

  constructor(private dragable: DragableService, private parivesh: PariveshServices,) {
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      const dl: any[] = layerData.filter((element: any) => element.decision_layer == true);
      for (let index = 0; index < dl.length; index++) {
        this.decisionLayers.push({ item_id: dl[index].ggllayerid, item_text: dl[index].layernm, item_url: dl[index].layerurl });
      }
    });
  }

  ngOnInit() {

  }

  async swipeIcon(idName: any) {
    this.swipeShow = !this.swipeShow;
    this.dragable.registerDragElement(idName);

    const [Swipe] = await loadModules(["esri/widgets/Swipe"]);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;

    else
      this.PariveshGIS = await t.ESRIObj_;


    this.swipeTool = new Swipe({
      view: this.PariveshGIS.ArcView,
      position: 50
    });

    this.resetSwipe();
  }


  async onTrailingLayerSelect(data: any) {
    // change baseMap on the map
    changeBaseMap(data.item_id, this.PariveshGIS.ArcMap);
  }



  async onLeadingLayerSelect(data: any) {
    const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);
    const getLayerUrl = this.decisionLayers.filter((elem) => elem.item_text === this.selectedItems_Decision[0].item_text);

    this._leadinglayer = new FeatureLayer({
      url: getLayerUrl[0].item_url,
      apiKey: Bharatmaps,
      title: this.selectedItems_Decision[0].item_text,
      visible: true
    });
    this.PariveshGIS.ArcMap.add(this._leadinglayer);
  }

  swipeTooldirection(evt: any, data: any) {
    if (data == 'vertical') {
      this.swipeTool.direction = "vertical";
    }
    else {
      this.swipeTool.direction = "horizontal";
    }
    this.swipeTool.visible = true;
    this.swipeTool.trailingLayers = [this._tailinglayerObj];
    this.swipeTool.leadingLayers = [this._leadinglayer, this._tailinglayerObj];
    this.PariveshGIS.ArcView.ui.add(this.swipeTool);
  }

  resetSwipe() {
    this.selectedItems_Decision = [];
    this.selectedTrailing_Layer = [];
    this.PariveshGIS.ArcMap.basemap = null;
    this.swipeTool.visible = false;
    this._leadinglayer.visible = false;

    // change baseMap on the map
    changeBaseMap('NIC_Street', this.PariveshGIS.ArcMap);
  }

}
