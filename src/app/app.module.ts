import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { NgOptimizedImage } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from '../material-module'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { PariveshServices } from './services/GISLayerMasters.service'
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { GisComponentComponent } from './components/parivesh-map/parivesh-map.component';
import { BufferComponent } from './components/buffer/buffer.component';
import { ForestComponent } from './components/forest/forest.component';
import { LayersComponent } from './components/layers/layers.component';
import { PrintComponent } from './components/print/print.component';
import { QueryBuilderComponent } from './components/query-builder/query-builder.component';
import { LegendComponent } from './components/legend/legend.component';
import { XyComponent } from './components/xy/xy.component';
import { SpatialSearchComponent } from './components/spatial-search/spatial-search.component';
import { ScreenShotComponent } from './components/screen-shot/screen-shot.component';
import { SwipeComponent } from './components/swipe/swipe.component';
import { MeasureComponent } from './components/measure/measure.component';
import { SearchComponent } from './components/search/search.component';
import { TableComponent } from './commonComponents/table/table.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    GisComponentComponent,
    BufferComponent,
    ForestComponent,
    LayersComponent,
    PrintComponent,
    QueryBuilderComponent,
    LegendComponent,
    XyComponent,
    SpatialSearchComponent,
    ScreenShotComponent, SwipeComponent, MeasureComponent, SearchComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    MatNativeDateModule
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }, PariveshServices],
  entryComponents: [],
  bootstrap: [AppComponent, LayersComponent],
  exports: []
})
export class AppModule { }

//platformBrowserDynamic().bootstrapModule(AppModule);.catch(err => console.error(err));
