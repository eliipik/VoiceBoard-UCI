import { message } from 'antd';

export default class History {
  private canvas: fabric.Canvas | null = null;
  private history: any[] = [];
  private static instance: History | null = null;
  private statePointer: number = -1;
  private processing: boolean = false;

  public static getInstance() {
    if (History.instance == null) {
      History.instance = new History();
    }
    return History.instance;
  }

  private constructor() {}

  initialize = (canvas: fabric.Canvas) => {
    this.canvas = canvas;
    this.bindAll();
  };

  setProcessing(b: boolean) {
    this.processing = b;
  }

  bindAll() {
    this.canvas!.on({
      'object:added': this.onChange,
      'object:removed': this.onChange,
      'object:modified': this.onChange,
    });
  }
  unbindAll() {
    this.canvas!.on({
      'object:added': () => {},
      'object:removed': () => {},
      'object:modified': () => {},
    });
  }

  onChange = () => {
    if (!this.processing) {
      this.statePointer += 1;
      if (this.statePointer < this.history.length) {
        this.history[this.statePointer] = JSON.stringify(this.canvas!.toJSON());

        while (this.history.length - 1 > this.statePointer) {
          this.history.pop();
        }
      } else {
        this.history.push(JSON.stringify(this.canvas!.toJSON()));
      }
    }
  };

  undo = () => {
    if (this.canvas === null || this.statePointer === -1) {
      //   console.error('History.ts: Nothing to undo.');
      message.error('Nothing to undo');
      return;
    }

    this.setProcessing(true);
    this.statePointer -= 1;
    if (this.statePointer !== -1) {
      this.canvas!
        .loadFromJSON(this.history[this.statePointer], () => {})
        .renderAll();
    } else {
      this.canvas!.clear();
    }
    this.setProcessing(false);
  };

  redo = () => {
    if (this.canvas === null || this.statePointer + 1 === this.history.length) {
      //   console.error('History.ts: Nothing to redo.');
      message.error('Nothing to redo');
      return;
    }

    this.setProcessing(true);
    this.statePointer += 1;
    this.canvas!
      .loadFromJSON(this.history[this.statePointer], () => {})
      .renderAll();
    this.setProcessing(false);
  };

  clear = () => {
    this.history = [];
    this.statePointer = -1;
  };
}
