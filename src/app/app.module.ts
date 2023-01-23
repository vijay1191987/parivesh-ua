import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from '../material-module'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { PariveshServices } from './services/GISLayerMasters.service'
import { APP_BASE_HREF } from '@angular/common';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PariveshMapComponent } from './components/parivesh-map/parivesh-map.component';
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
import { DssToolsComponent } from './components/dss-tools/dss-tools.component';
import { CafComponent } from './components/caf/caf.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { KyaComponent } from './components/kya/kya.component';



const _routes: Routes = [
  { path: '', component: PariveshMapComponent, title: 'Parivesh GIS' },
  { path: 'caf', component: CafComponent, title: 'CAF GIS' },
  { path: 'kya', component: KyaComponent, title: 'KYA GIS' },
  { path: 'dss', component: DssToolsComponent, title: 'DSS GIS' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PariveshMapComponent,
    BufferComponent,
    ForestComponent,
    LayersComponent,
    PrintComponent,
    QueryBuilderComponent,
    LegendComponent,
    XyComponent,
    SpatialSearchComponent,
    ScreenShotComponent, SwipeComponent, MeasureComponent, SearchComponent,
    TableComponent,
    DssToolsComponent,
    CafComponent,
    KyaComponent
  ],
  imports: [
    RouterModule.forRoot(_routes, {
      useHash: true,
      paramsInheritanceStrategy: "always",
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
      enableTracing: false
    }),
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    NgOptimizedImage,
    ReactiveFormsModule
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }, { provide: APP_BASE_HREF, useValue: '/apps/' }, PariveshServices, LayersComponent],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }
