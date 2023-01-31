import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DragableService } from 'src/app/services/dragable.service';
import { TableComponent } from '../../commonComponents/table/table.component';

@Component({
  selector: 'app-proximity',
  templateUrl: './proximity.component.html',
  styleUrls: ['./proximity.component.css']
})
export class ProximityComponent {

  headArray = [
    { 'Head': 'User Name', 'FieldName': 'name' },
    { 'Head': 'Email', 'FieldName': 'email' },
    { 'Head': 'Contact', 'FieldName': 'phone' },
    { 'Head': 'Website', 'FieldName': 'website' },
    { 'Head': 'Action', 'FieldName': '' }
  ];

  usersList: any[] = [];
  constructor(private dragable: DragableService, private bottomSheet: MatBottomSheet,  private http: HttpClient) {

    this.http.get('https://jsonplaceholder.typicode.com/users').subscribe((result: any) => {
      this.usersList = result;
    })

  }

  swipeShow:boolean = false;
  swipeIcon(idName: any)
  {
    this.swipeShow = !this.swipeShow;
    this.dragable.registerDragElement(idName);
  }

   //  bottom sheet
   openBottomSheet(): void {
    this.bottomSheet.open(TableComponent, {
      data: { tableHeader: this.headArray, rowData: this.usersList},
      hasBackdrop: true,
      closeOnNavigation: false,
      disableClose: true,
    });
  }
}
