import { Component } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-tool-results',
  templateUrl: './tool-results.component.html',
  styleUrls: ['./tool-results.component.css']
})
export class ToolResultsComponent {

  constructor(private bottomSheetRef: MatBottomSheetRef<ToolResultsComponent>) {}
  closeBotton(event: MouseEvent): void{
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
