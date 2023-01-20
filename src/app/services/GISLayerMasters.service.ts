import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { LayerNode } from '../components/layers/layers.component';

@Injectable()
export class PariveshServices {
    private layerTreeData = new BehaviorSubject<LayerNode[]>([]);
    public currentLayerTreeData = this.layerTreeData.asObservable();
    constructor(private http: HttpClient) { };
    getGISLayers() {
        return this.http.get("https://stgdev.parivesh.nic.in/ua-dev/gislayer/getlayerslist");
    }
    updateLayer(data: LayerNode[]) {
        this.layerTreeData.next(data);
    }
}