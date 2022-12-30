import { Component, OnInit, Input } from '@angular/core';
import { LayersComponent, LayerNode } from './../layers/layers.component'
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})


export class LegendComponent implements OnInit {
  //{To Access ESRI MapView object}
  @Input() MapObject: object = {};
  PariveshGIS: any = {};
 
  constructor() { }

  legendShow: boolean = false;
  async legendIcon() {
    let treeData = [];
    const data = {
      LayerName: "Test", LayerID: 11, children: [
        {
          LayerName: "2 Series",
          children: [
            { LayerName: "Coupé", LayerID: 5 },
            { LayerName: "Gran Coupé", LayerID: 6 }
          ]
        },
        {
          LayerName: "3 Series",
          children: [
            { LayerName: "Sedan", LayerID: 7 },
            { LayerName: "PHEV", LayerID: 8 }
          ]
        }
      ]
    };
    treeData.push(data);
    const TREE_DATA: LayerNode[] = treeData;
   // this.layerCom.updateTreeData(TREE_DATA);


    if (!this.legendShow) {
      const [Legend] = await loadModules(["esri/widgets/Legend"]);
      let legend = new Legend({
        view: this.PariveshGIS.MapView,
        container: document.getElementById("legendDIV"),
        style: {
          type: "classic",
          layout: "auto"
        }
      });
      const t: any = this.MapObject;
      this.PariveshGIS = await t.PariveshMap;
      this.PariveshGIS.MapView.ui.add(legend, "bottom-right");
    }
    else {

    }
    this.legendShow = !this.legendShow;
  //  console.log(this.layerCom.dataSource);
    //this.layerCom.ForTest();
  }
  ngOnInit(): void {        
  }

}
