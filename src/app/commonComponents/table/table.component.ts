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
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public tableData: { tableHeader: string[], rowData: string[] }) { }

  ngOnInit(): void {
    console.log(this.tableData);
    this.HeadArray = this.tableData.tableHeader;
    this.GridArray = this.tableData.rowData;
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
}



// interface Country {
// 	name: string;
// 	flag: string;
// 	area: number;
// 	population: number;
// }

// const COUNTRIES: Country[] = [
// 	{
// 		name: 'Russia',
// 		flag: 'f/f3/Flag_of_Russia.svg',
// 		area: 17075200,
// 		population: 146989754,
// 	},
// 	{
// 		name: 'Canada',
// 		flag: 'c/cf/Flag_of_Canada.svg',
// 		area: 9976140,
// 		population: 36624199,
// 	},
// 	{
// 		name: 'United States',
// 		flag: 'a/a4/Flag_of_the_United_States.svg',
// 		area: 9629091,
// 		population: 324459463,
// 	},
// 	{
// 		name: 'China',
// 		flag: 'f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
// 		area: 9596960,
// 		population: 1409517397,
// 	},
// ];

