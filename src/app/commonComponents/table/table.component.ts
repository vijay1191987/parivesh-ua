import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
  styleUrls: ['table.component.css']
})
export class TableComponent implements OnInit {
  HeadArray: any[] = [];
  GridArray: any[] = [];
  pariveshGIS: any;

  constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public tableData: { tableHeader: string[], rowData: any[], pariveshGIS: any }) { }

  ngOnInit(): void {
    this.HeadArray = this.tableData.tableHeader;
    this.GridArray = this.tableData.rowData;
    this.pariveshGIS = this.tableData.pariveshGIS;
  }

  edit(item: any) {
    console.log(item);
  }
  delete(item: any) {
    console.log(item);
  }
  closeBotton(event: MouseEvent): void {
    event.preventDefault();
    this.bottomSheetRef.dismiss();
  }
  handleViewClick(data: any) {
    this.pariveshGIS.ArcView.goTo({ target: data.geometry })
  }
}
