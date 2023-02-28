import { Component, OnInit } from '@angular/core';
import { DssToolsComponent } from '../dss-tools/dss-tools.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchBox: boolean = false;
  proposalBox: boolean = false;
  proposalno: string = '';

  constructor(private dssRef: DssToolsComponent) { }

  ngOnInit(): void {
  }

  menuBtn() {
    this.proposalBox = !this.proposalBox;
  }
  searchEvent() {
    const sbox: any = document.getElementById("txtSearchbox");
    this.proposalno = sbox.value;
    if (this.proposalno != '' || this.proposalno != null) {
      const _payload = { proposalno: this.proposalno };
      this.dssRef.searchProposalData(_payload);
    }
    else
      alert("Please provide a proposal No!!");
  }
}
