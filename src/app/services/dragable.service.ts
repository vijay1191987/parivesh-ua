import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DragableService {

  constructor() { }


  // dragble start

  registerDragElement(element: any) {
    const elmnt = document.getElementById(element);
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragMouseDown = (e: any) => {
      e = e || window.event;
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e: any) => {
      e = e || window.event;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt!.style.top = elmnt!.offsetTop - pos2 + 'px';
      elmnt!.style.left = elmnt!.offsetLeft - pos1 + 'px';
    };

    const closeDragElement = () => {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    };

    if (document.getElementById(elmnt!.id + 'header')) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elmnt!.id + 'header')!.onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt!.onmousedown = dragMouseDown;
    }
  }
  // dragble end
}
