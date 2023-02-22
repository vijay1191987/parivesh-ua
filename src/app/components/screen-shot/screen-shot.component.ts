import { Component, OnInit, Input } from '@angular/core';
import { DragableService } from 'src/app/services/dragable.service';
import { loadModules } from 'esri-loader'


let context: any = {};
let screenshottst: any = window.navigator;
let screenshot: any = {};
@Component({
  selector: 'app-screen-shot',
  templateUrl: './screen-shot.component.html',
  styleUrls: ['./screen-shot.component.css']
})
export class ScreenShotComponent implements OnInit {
  @Input() MapData: any = {};
  PariveshGIS: any = {};
  isModalOpen: boolean = false;
  ESRIObject: object = {};
  ESRIObj_: any = null;
  xyShow: boolean = false;
  screenshotShow: boolean = false;
  screenshotImage: any = {};

  constructor(private dragable: DragableService) { }

  async ngOnInit() {
    const t: any = this.MapData;
    if (t.ESRIObj_.hasOwnProperty("ESRIObj_")) {
      this.PariveshGIS = await t.ESRIObj_.ESRIObj_;
    }
    else {
      this.PariveshGIS = await t.ESRIObj_;
      console.log('screen-shot-component: ', this.PariveshGIS);
    }
  }

  async screenshotIcon(idName: any) {
    this.screenshotShow = !this.screenshotShow;
    this.dragable.registerDragElement(idName);
  }

  screenshotFunc(evt: any) {
    evt.currentTarget.classList.add("active");
    this.PariveshGIS.ArcView.container.classList.add("screenshotCursor");
    let area: any = null;

    const dragHandler = this.PariveshGIS.ArcView.on("drag", (event: any) => {
      // prevent navigation in the view
      event.stopPropagation();
      // when the user starts dragging or is dragging
      if (event.action !== "end") {
        // calculate the extent of the area selected by dragging the cursor
        const xmin = this.clamp(
          Math.min(event.origin.x, event.x),
          0,
          this.PariveshGIS.ArcView.width
        );
        const xmax = this.clamp(
          Math.max(event.origin.x, event.x),
          0,
          this.PariveshGIS.ArcView.width
        );
        const ymin = this.clamp(
          Math.min(event.origin.y, event.y),
          0,
          this.PariveshGIS.ArcView.height
        );
        const ymax = this.clamp(
          Math.max(event.origin.y, event.y),
          0,
          this.PariveshGIS.ArcView.height
        );
        area = {
          x: xmin,
          y: ymin,
          width: xmax - xmin,
          height: ymax - ymin
        };
        // set the position of the div element that marks the selected area
        this.setMaskPosition(area);
      } else {
        // remove the drag event listener from the SceneView
        dragHandler.remove();
        // the screenshot of the selected area is taken
        this.PariveshGIS.ArcView
          .takeScreenshot({ area: area, format: "png" })
          .then((screenshot: any) => {
            // display a preview of the image
            this.screenshotImage = screenshot;
            this.showPreview(screenshot);
            // the screenshot mode is disabled

            evt.srcElement.classList.remove("active");
            this.PariveshGIS.ArcView.container.classList.remove("screenshotCursor");
            this.setMaskPosition(null);
          });
      }
    });
  }

  downloadHandler() {
    const text = ((document.getElementById("textInput") as HTMLInputElement).value);
    console.log("anup", text);
    const dataUrl = this.getImageWithText(this.screenshotImage, "Test");
    this.downloadImage(
      `aoi.png`,
      dataUrl
    );
  }
  setMaskPosition(area: any) {
    // the orange mask used to select the area
    const maskDiv = document.getElementById("maskDiv")!
    if (area) {
      maskDiv.classList.remove("hide");
      maskDiv.style.left = `${area.x}px`;
      maskDiv.style.top = `${area.y}px`;
      maskDiv.style.width = `${area.width}px`;
      maskDiv.style.height = `${area.height}px`;
    } else {
      maskDiv.classList.add("hide");
    }
  }

  clamp(value: any, from: any, to: any) {
    return value < from ? from : value > to ? to : value;
  }
  showPreview(screenshot: any) {
    const screenshotDiv: any = document.getElementById("screenshotDiv");
    screenshotDiv.classList.remove("hide");
    // add the screenshot dataUrl as the src of an image element

    this.screenshotImage = document.getElementsByClassName(
      "js-screenshot-image"
    )[0];
    this.screenshotImage.width = screenshot.data.width;
    this.screenshotImage.height = screenshot.data.height;
    this.screenshotImage.src = screenshot.dataUrl;

  }

  // returns a new image created by adding a custom text to the webscene image
  getImageWithText(screenshot: any, text: any) {
    const imageData = screenshot.data;

    // to add the text to the screenshot we create a new canvas element
    const canvas:any = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = imageData.height;
    canvas.width = imageData.width;

    // add the screenshot data to the canvas
    context.putImageData(imageData, 0, 0);
    context.font = "20px Arial";
    context.fillStyle = "#000";
    context.fillRect(
      0,
      imageData.height - 40,
      context.measureText(text).width + 20,
      30
    );

    // add the text from the textInput element
    context.fillStyle = "#fff";
    context.fillText(text, 10, imageData.height - 20);

    return canvas.toDataURL();
  }
  downloadImage(filename: any, dataUrl: any) {
    // the download is handled differently in Microsoft browsers
    // because the download attribute for <a> elements is not supported
    if (!screenshottst.msSaveOrOpenBlob) {
      // in browsers that support the download attribute
      // a link is created and a programmatic click will trigger the download
      const element = document.createElement("a");
      element.setAttribute("href", dataUrl);
      element.setAttribute("download", filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // for MS browsers convert dataUrl to Blob
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      // download file
      screenshottst.msSaveOrOpenBlob(blob, filename);
    }
  }

  closeBtnHandler() {
    const screenshotDiv: any = document.getElementById("screenshotDiv");
    screenshotDiv.classList.add("hide");
  }

}
