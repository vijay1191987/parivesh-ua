import { Component, OnInit, Input } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { loadModules } from 'esri-loader';



let elevationProfile: any = null;

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.css']
})
export class MeasureComponent implements OnInit {
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  isModalOpen: boolean = false;
  ESRIObject: object = {};
  ESRIObj_: any = null;
  xyShow: boolean = false;
  elevationShow:boolean = false;

  

  constructor(private dragable: DragableService) { }
  async ngOnInit(){   
    
  }
   
  async elevationIcon(idName: any)
  {
    this.elevationShow = !this.elevationShow;
    this.dragable.registerDragElement(idName);
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_")) {
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    }
    else {
      this.PariveshGIS = await t.ESRIObj_;
      console.log('measure-component: ', this.PariveshGIS);
    } 
    
    const [ESRIMap,ElevationProfile,ElevationLayer,Ground] = await loadModules(['esri/Map',"esri/widgets/ElevationProfile","esri/layers/ElevationLayer","esri/Ground"]);

    const worldElevation = new ElevationLayer({
      url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
      id: "elevationlayer"
    });
    // this.PariveshGIS.ArcMap = new ESRIMap({
    //   basemap: null
    // });

    this.PariveshGIS.ArcMap.ground.layers.add(worldElevation);                    
    
    
    elevationProfile = new ElevationProfile({
      view: this.PariveshGIS.ArcView,
      profiles: [
        {
          type: "ground" // first profile line samples the ground elevation
        },
        {
          type: "view" // second profile samples the view and shows building profiles
        }
      ],
      visibleElements: {
        selectButton: false
      }
    });
    
    
  } 
  async elevProfile(){  
    //const elevationbtn = document.getElementById("elevation");  
    var search = document.getElementsByClassName("esri-elevation-profile").length;
      if (search > 0) {
        this.closeElavation();
      }
      else {
        this.elevation1();
      }
  }
  
  async elevation1() {
    
    this.PariveshGIS.ArcView.ui.add(elevationProfile, 'bottom-right');
  }
  closeElavation() {
    while (document.getElementsByClassName('esri-elevation-profile')[0]) {
      document.getElementsByClassName('esri-elevation-profile')[0].remove();
    }

}
}
