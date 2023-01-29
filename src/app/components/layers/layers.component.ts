import { Component, OnInit, Input, Injectable } from '@angular/core';
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { groupByJsonData, renameJSONKey, createMapImageLayer, getLayerMasters } from "./../gisHelper";
import { Bharatmaps } from "./../gisHelper/localConfigs";
import axios from 'axios';
import { PariveshServices } from 'src/app/services/GISLayerMasters.service';

export interface LayerNode {
  LayerName: string;
  LayerID?: number;
  LegendPath?: string;
  children?: LayerNode[];
  selected?: boolean;
  indeterminate?: boolean;
  parent?: LayerNode;
  reqType?: string;
}

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css']
})
@Injectable({ providedIn: 'root' })
export class LayersComponent implements OnInit {
  //{To Access ESRI MapView object}
  @Input() MapData: any = {};
  PariveshGIS: any = {};

  public treeControl = new NestedTreeControl<LayerNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<LayerNode>();

  public searchString = '';
  public showOnlySelected = false;
  public layersShow: boolean = false;

  constructor(private parivesh: PariveshServices) {
    // subscribe to sender component messages
    this.parivesh.currentLayerTreeData.subscribe(layerData => {
      const _kj = this.dataSource.data;
      this.dataSource.data = [];
      this.dataSource.data = [...layerData, ..._kj];
      Object.keys(this.dataSource.data).forEach((key: any) => {
        this.setParent(this.dataSource.data[key]);
      });
    });
  }
  ngOnDestroy() { // It's a good practice to unsubscribe to ensure no memory leaks
    //this.subscriptionName.unsubscribe();
  }

  async ngOnInit() {
    let pOBJ: any = [];
    let treeData: any[] = [];
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_"))
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    else
      this.PariveshGIS = await t.ESRIObj_;

    const res = await getLayerMasters();
    let layerMasters = groupByJsonData(res.data, "group_layer");

    Object.keys(layerMasters).map(async (_d: any) => {
      const myPromise = new Promise((resolve, reject) => {
        layerMasters[_d].map((obj: any) => {
          renameJSONKey(obj, 'layernm', 'LayerName');
          renameJSONKey(obj, 'ggllayerid', 'LayerID');
          let _ur = obj.layerurl.trim().split('MapServer');
          const _URL = _ur[0] + "MapServer/";
          axios.get(_URL + "legend", {
            params: {
              token: Bharatmaps,
              f: "pjson"
            }
          }).then((responseData: any) => {
            if (responseData.data.hasOwnProperty("layers")) {
              const g = responseData.data.layers.filter((f: any) => f.layerId === obj.LayerID);
              if (g.length > 0)
                obj["LegendPath"] = "data:image/png;base64," + g[0].legend[0].imageData;
              else
                console.log("No Legend for " + obj.LayerName + " AND " + obj.layerurl + "##" + obj.LayerID);
            }
            const ret = { node: layerMasters[_d] };
            resolve(ret);
          }).catch((error) => {
            reject(error);
          });
        });
      });
      pOBJ.push(myPromise);
    });
    Promise.all(pOBJ).then((values: any) => {
      values.forEach((_a: any) => {
        const data = { LayerName: _a.node[0].group_layer.trim(), LayerID: _a.node[0].glayerid, children: _a.node };
        treeData.push(data);
      });
      const TREE_DATA: LayerNode[] = treeData;
      this.dataSource.data = TREE_DATA;
    });
  }

  public hasChild = (_: number, node: LayerNode) =>
    !!node.children && node.children.length > 0;

  private setParent(node: LayerNode, parent: LayerNode = {} as LayerNode) {
    node.parent = parent;
    if (node.children) {
      node.children.forEach(childNode => {
        this.setParent(childNode, node);
      });
    }
  }

  private checkAllParents(node: LayerNode) {
    if (node.parent) {
      const descendants = this.treeControl.getDescendants(node.parent);
      node.parent.selected =
        descendants.every(child => child.selected);
      node.parent.indeterminate =
        descendants.some(child => child.selected);
      this.checkAllParents(node.parent);
    }
  }

  public async itemToggle(checked: boolean, node: LayerNode) {
    node.selected = checked;
    let layerConfigs: any = node;
    if (node.children) {
      node.children.forEach((child) => {
        this.itemToggle(checked, child);
      });
    }
    this.checkAllParents(node);
    if (node.hasOwnProperty("reqType")) {
      let layerFeature = null;
      if (node.reqType === "CAF") {
        const _lyr: any = this.PariveshGIS.ArcMap.findLayerById("EsriUserMap");
        layerFeature = _lyr.graphics.items.filter((f: any) => f.id === node.LayerID);
      }
      else if (node.reqType === "DSS") {
        layerFeature = [this.PariveshGIS.ArcMap.findLayerById("EsriUserMap_" + node.LayerName.replace(' ', ''))];
      }
      layerFeature[0].visible = checked;
      this.PariveshGIS.ArcView.goTo({ target: layerFeature });
    }
    else {
      const uniqueLayerID = layerConfigs.LayerName.trim() + "_" + layerConfigs.glayerid + "_" + layerConfigs.layerurl.trim().charAt(layerConfigs.layerurl.trim().length - 1);
      const _layer = this.PariveshGIS.ArcMap.findLayerById(uniqueLayerID);
      if (checked && _layer === undefined) {
        const _params = {
          apiKey: Bharatmaps,
          url: layerConfigs.layerurl.trim().slice(0, -1),
          copyright: layerConfigs.layer_description,
          customParameters: { token: Bharatmaps },
          legendEnabled: true,//layerConfigs.legend_enabled,
          opacity: layerConfigs.gglopacity,
          title: layerConfigs.LayerName.trim(),
          id: uniqueLayerID,
          visible: true, //layerConfigs.glvisiblity,
          sublayers: [
            {
              id: layerConfigs.layerurl.trim().charAt(layerConfigs.layerurl.trim().length - 1),
              visible: true,
              popupEnabled: true
            }
          ]
        };
        const _ly = await createMapImageLayer(_params);
        this.PariveshGIS.ArcMap.add(_ly);
      }
      else {
        _layer.visible = false;
        this.PariveshGIS.ArcMap.remove(_layer);
      }
    }
  }

  public hideLeafNode(node: LayerNode): boolean {
    return this.showOnlySelected && !node.selected
      ? true
      : new RegExp(this.searchString, 'i').test(node.LayerName.trim()) === false;
  }

  public hideParentNode(node: LayerNode): boolean {
    return this.treeControl
      .getDescendants(node)
      .filter(node => node.children == null || node.children.length === 0)
      .every(node => this.hideLeafNode(node));
  }
}
