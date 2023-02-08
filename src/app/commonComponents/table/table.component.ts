import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  //   countries = COUNTRIES;
  HeadArray: any[] = [];
  GridArray: any[] = [];
  pariveshGIS: any;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public tableData: { tableHeader: string[], rowData: string[], pariveshGIS:any  }) { }

  ngOnInit(): void {
    console.log(this.tableData);
    this.HeadArray = this.tableData.tableHeader;
    this.GridArray = this.tableData.rowData;
    this.pariveshGIS = this.tableData.pariveshGIS;
  }
  edit(item: any) {
    console.log(item);
    // this.onEdit.emit(item);
  }
  delete(item: any) {
    //this.onDelete.emit(item);
  }
  closeBotton(event: MouseEvent): void {
    event.preventDefault();
    this.bottomSheetRef.dismiss();
  }

  handleSelected(event:any,data:any){
    this.pariveshGIS.ArcView.goTo({target: data.Geom})
  }
}
