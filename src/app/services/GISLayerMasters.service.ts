import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayerNode } from '../components/layers/layers.component'
import { getLayerMasters } from '../components/gisHelper';

@Injectable({
    providedIn: 'root'
})
export class PariveshServices {
    private layerTreeData = new BehaviorSubject<LayerNode[]>([]);
    public currentLayerTreeData = this.layerTreeData.asObservable();
    constructor() { };
    public updateLayer(data: LayerNode[]) {
        this.layerTreeData.next(data);
    }
    public async getLayerMasters() {
        const res = await getLayerMasters();
        let _data: any[] = res.data;
        this.layerTreeData.next(_data);
    }
}