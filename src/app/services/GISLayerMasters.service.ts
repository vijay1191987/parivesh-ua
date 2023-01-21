import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayerNode } from '../components/layers/layers.component';

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
}