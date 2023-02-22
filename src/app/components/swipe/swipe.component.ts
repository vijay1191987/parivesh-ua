import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { loadModules } from 'esri-loader';
import { fetchDataEsriService, createFillSymbol, getUserKMLFromTree, CreateEsrisymbol } from "./../gisHelper";
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';
import { Bharatmaps } from "../gisHelper/localConfigs";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TableComponent } from 'src/app/commonComponents/table/table.component';


@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.css']
})
export class SwipeComponent implements OnInit {
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  decisionLayers: any[] = [];
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

  trailingdata = [{ item_id: "satillite", item_text: "Satillite" }, { item_id: "BingMap", item_text: "Bing Map" }];

  selectedItems_Decision: any = [];
  selectedTrailing_Layer: any = [];
  proposalAllKMLs: any = [];
  swipeTool:any;
  constructor(private dragable: DragableService, private parivesh: PariveshServices,) {
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      if (layerData.length > 0) {
        if (layerData[0].hasOwnProperty('selected')) {
          const _data = getUserKMLFromTree(layerData[0]);
          let userkmls = [...new Set([..._data[0], ..._data[1]])];
          for (let index = 0; index < userkmls.length; index++) {
            const f = { item_id: index, item_text: userkmls[index] };
            this.proposalAllKMLs.push(f);
          }
        }
        else {
          const dl: any[] = layerData.filter((element: any) => element.decision_layer == true);
          for (let index = 0; index < dl.length; index++) {
            this.decisionLayers.push({ item_id: dl[index].ggllayerid, item_text: dl[index].layernm, item_url: dl[index].layerurl });
          }
        }
      }
    });
  }

  async ngOnInit(){

    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;
  }

  swipeShow:boolean = false;
  swipeIcon(idName: any)
  {
    this.swipeShow = !this.swipeShow;
    this.dragable.registerDragElement(idName);
  }
  _leadinglayer:any = {};
  _tailinglayerObj:any = {};

  async onTrailingLayerSelect(data: any) {
    const [ Basemap, MapImageLayer, BingMapsLayer, FeatureLayer] = await loadModules(["esri/Basemap",  "esri/layers/MapImageLayer", "esri/layers/BingMapsLayer", "esri/layers/FeatureLayer"]);

    let satellite1 = new MapImageLayer({
      url: "https://imageservice.nic.in/NIC/esri/rest/services/State/MapServer",
      minScale: 0,
      maxScale: 0,
      id: "NICSatillite"
    });

    let customBasemap_NICSatillite = new Basemap({
      baseLayers: [satellite1],//
      thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/411.png",
      title: "NICSatillite",
      id: "basemap_NICSatillite"
    });

    let bing = new BingMapsLayer({
      style: "aerial",
      key: "Ag_mDFNXJ7s26uIQhN3T02lsiSzerxVmcUfCdAvsMAwIluiNwFABfrvge81w0O7T"
    });

    let microsoftBingMap = new Basemap({
      baseLayers: [bing],
      title: "Bing",
      id: "Bing-Map",
      thumbnailUrl: "D:\\Bing.jpeg"
    });


    let _tailinglayer = this.selectedTrailing_Layer[0].item_id;

    if(_tailinglayer == 'satillite'){
      this.PariveshGIS.ArcMap.basemap = customBasemap_NICSatillite;
      this._tailinglayerObj = satellite1;
    }
    if(_tailinglayer == 'BingMap'){
      this.PariveshGIS.ArcMap.basemap = microsoftBingMap;
      this._tailinglayerObj = bing;
    }


  }



  async onLeadingLayerSelect(data: any){
    const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);
    this._leadinglayer = new FeatureLayer({
      apiKey:Bharatmaps,
      visible: true
    });
    this._leadinglayer.url = this.selectedItems_Decision[0].item_url;
    this._leadinglayer.title = this.selectedItems_Decision[0].item_text;
  }

  async swipeTooldirection(evt:any, data:any){
    const [ Swipe, Legend, Basemap, MapImageLayer, BingMapsLayer, FeatureLayer] = await loadModules(["esri/widgets/Swipe","esri/widgets/Legend", "esri/Basemap",  "esri/layers/MapImageLayer", "esri/layers/BingMapsLayer", "esri/layers/FeatureLayer"]);

    this.PariveshGIS.ArcMap.addMany([this._leadinglayer]);

    this.swipeTool = new Swipe({
      view: this.PariveshGIS.ArcView,
      position: 50,
      visible:true
    });
    if(data == 'vertical'){
      this.swipeTool.direction = "vertical";
    }
    else if(data == 'horizontal'){
      this.swipeTool.direction = "horizontal";
    }

    this.swipeTool.trailingLayers = [this._tailinglayerObj];
    this.swipeTool.leadingLayers = [this._leadinglayer, this._tailinglayerObj];

    this.PariveshGIS.ArcView.ui.add(this.swipeTool);
  }

}
