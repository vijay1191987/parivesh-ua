import { Component, OnInit } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import {HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent implements OnInit { 

  constructor(private dragable: DragableService, private http: HttpClient) { 
  } 

  queryBuilderShow:boolean = false; 
  queryBuilderIcon(idName: any)
  {
    this.queryBuilderShow = !this.queryBuilderShow;
    this.dragable.registerDragElement(idName);
  }

  selectContent:string = "Select";
  dropClick(SelectedDropDown:string)
  {
    this.selectContent=SelectedDropDown;
  } 

  ngOnInit(): void {
    this.loadUsers();
  }


  // table start

    
  usersList: any [] = [];
  headArray = [
    {'Head': 'User Name', 'FieldName': 'name' },
    {'Head': 'Email', 'FieldName': 'email' },
    {'Head': 'Contact', 'FieldName': 'phone' },
    {'Head': 'Website', 'FieldName': 'website' } ,
    {'Head': 'Action', 'FieldName': '' } 
  ];

  loadUsers() {
    this.http.get('https://jsonplaceholder.typicode.com/users').subscribe((result: any)=> {
     this.usersList = result;
    })
  }
 
  editUser(item: any) {
    debugger;
  }
  deleteUser(item: any) {
    debugger;
  }

}
