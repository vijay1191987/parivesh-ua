import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent implements OnInit {

  constructor(private dragable: DragableService, private http: HttpClient) {
  }

  queryBuilderShow: boolean = false;
  queryBuilderIcon(idName: any) {
    this.queryBuilderShow = !this.queryBuilderShow;
    this.dragable.registerDragElement(idName);
  }

  selectContent: string = "Select";
  dropClick(SelectedDropDown: string) {
    this.selectContent = SelectedDropDown;
  }

  ngOnInit(): void {
  }
}
