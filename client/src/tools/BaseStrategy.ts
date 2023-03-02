import { fabric } from 'fabric';

export default abstract class BaseStrategy {
  private canvas: fabric.Canvas;
  private cb: Function | null;

  constructor(canvas: fabric.Canvas, cb: Function | null = null) {
    this.canvas = canvas;
    this.cb = cb;
  }

  getCanvas() {
    return this.canvas;
  }

  callback() {
    if (this.cb !== null) {
      this.cb!();
    }
  }

  abstract onMouseDown(event: fabric.IEvent): void;
  abstract onMouseMove(event: fabric.IEvent): void;
  abstract onMouseUp(event: fabric.IEvent): void;
}
