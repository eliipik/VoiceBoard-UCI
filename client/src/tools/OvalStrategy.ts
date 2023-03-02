/**
 * Citation: https://stackoverflow.com/questions/34100866/how-to-free-draw-ellipse-using-fabricjs
 */

import BaseStrategy from './BaseStrategy';
import { fabric } from 'fabric';
import History from '../util/History';

export default class OvalStrategy extends BaseStrategy {
  private ellipse: fabric.Ellipse | null = null;
  private isDown: boolean = false;
  private origX: number | null = null;
  private origY: number | null = null;

  onMouseDown(event: fabric.IEvent): void {
    History.getInstance().setProcessing(true);
    this.isDown = true;
    const pointer = this.getCanvas().getPointer(event.e);
    this.origX = pointer.x;
    this.origY = pointer.y;
    this.ellipse = new fabric.Ellipse({
      left: this.origX,
      top: this.origY,
      originX: 'left',
      originY: 'top',
      rx: pointer.x - this.origX,
      ry: pointer.y - this.origY,
      angle: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 1,
      strokeUniform: true,
    });
    this.getCanvas().add(this.ellipse);
  }

  onMouseMove(event: fabric.IEvent): void {
    if (!this.isDown) return;
    var pointer = this.getCanvas().getPointer(event.e);
    var rx = Math.abs(this.origX! - pointer.x) / 2;
    var ry = Math.abs(this.origY! - pointer.y) / 2;
    if (rx > this.ellipse!.strokeWidth!) {
      rx -= this.ellipse!.strokeWidth! / 2;
    }
    if (ry > this.ellipse!.strokeWidth!) {
      ry -= this.ellipse!.strokeWidth! / 2;
    }
    this.ellipse!.set({ rx: rx, ry: ry });

    if (this.origX! > pointer.x) {
      this.ellipse!.set({ originX: 'right' });
    } else {
      this.ellipse!.set({ originX: 'left' });
    }
    if (this.origY! > pointer.y) {
      this.ellipse!.set({ originY: 'bottom' });
    } else {
      this.ellipse!.set({ originY: 'top' });
    }
    this.getCanvas().renderAll();
  }

  onMouseUp(event: fabric.IEvent): void {
    this.isDown = false;
    this.getCanvas().remove(this.ellipse!);
    History.getInstance().setProcessing(false);
    this.getCanvas().add(this.ellipse!);
    this.ellipse!.selectable = false;
    this.ellipse = null;
    this.callback();
  }
}
