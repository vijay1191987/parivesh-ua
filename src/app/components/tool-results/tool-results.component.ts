import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-tool-results',
  templateUrl: './tool-results.component.html',
  styleUrls: ['./tool-results.component.css']
})
export class ToolResultsComponent {
  usersList: any[] = [];
  headArray = [
    { 'Head': 'User Name', 'FieldName': 'name' },
    { 'Head': 'Email', 'FieldName': 'email' },
    { 'Head': 'Contact', 'FieldName': 'phone' },
    { 'Head': 'Website', 'FieldName': 'website' },
    { 'Head': 'Action', 'FieldName': '' }
  ];


  constructor(private bottomSheetRef: MatBottomSheetRef<ToolResultsComponent>, private http: HttpClient) {
    this.loadUsers();
  }
  closeBotton(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  loadUsers() {
    this.http.get('https://jsonplaceholder.typicode.com/users').subscribe((result: any) => {
      this.usersList = result;
    })
  }
}
