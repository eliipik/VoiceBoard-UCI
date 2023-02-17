/**
 * Citation: http://jsfiddle.net/a7mad24/aPLq5/
 */

import BaseStrategy from './BaseStrategy';
import { fabric } from 'fabric';
import History from '../util/History';

export default class RectStrategy extends BaseStrategy {
  private rect: fabric.Rect | null = null;
  private isDown: boolean = false;
  private origX: number | null = null;
  private origY: number | null = null;

  onMouseDown(event: fabric.IEvent): void {
    History.getInstance().setProcessing(true);
    this.isDown = true;
    const pointer = this.getCanvas().getPointer(event.e);
    this.origX = pointer.x;
    this.origY = pointer.y;
    this.rect = new fabric.Rect({
      left: this.origX,
      top: this.origY,
      originX: 'left',
      originY: 'top',
      width: pointer.x - this.origX,
      height: pointer.y - this.origY,
      angle: 0,
      fill: 'rgba(0, 0, 0, 0.0)',
      borderColor: 'rgba(0, 0, 0, 1)',
      hasBorders: true,
      stroke: 'black',
      strokeWidth: 1,
      transparentCorners: false,
      strokeUniform: true,
    });
    this.getCanvas().add(this.rect);
  }

  onMouseMove(event: fabric.IEvent): void {
    if (!this.isDown) return;
    var pointer = this.getCanvas().getPointer(event.e);

    if (this.origX! > pointer.x) {
      this.rect!.set({ left: Math.abs(pointer.x) });
    }
    if (this.origY! > pointer.y) {
      this.rect!.set({ top: Math.abs(pointer.y) });
    }

    this.rect!.set({ width: Math.abs(this.origX! - pointer.x) });
    this.rect!.set({ height: Math.abs(this.origY! - pointer.y) });

    this.getCanvas().renderAll();
  }

  onMouseUp(event: fabric.IEvent): void {
    this.isDown = false;
    this.getCanvas().remove(this.rect!);
    History.getInstance().setProcessing(false);
    this.getCanvas().add(this.rect!);
    this.rect!.selectable = false;
    this.rect = null;
    this.callback();
  }
}
