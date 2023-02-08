import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  proposalno:any = null;
  constructor(private activatedRoute: ActivatedRoute) {
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.proposalno = params['proposalno'];
    });

  }

  ngOnInit(): void {

  }

  proposalBox:boolean = false;
  menuBtn()
  {
    this.proposalBox = !this.proposalBox;
  }

  searchBox:boolean = false;
  searchInput()
  {
    // this.searchBox = !this.searchBox;
  }


}
