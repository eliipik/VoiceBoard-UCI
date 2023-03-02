import io from 'socket.io-client';
import { Strategy } from '../common/Strategy';
import History from './History';
import { fabric } from 'fabric';
import { message } from 'antd';

export class MainConn {
  private static instance: MainConn | null = null;

  private canvas: fabric.Canvas | null = null;
  private setMode: Function | null = null;

  private constructor() {}

  public static getInstance() {
    if (MainConn.instance === null) {
      MainConn.instance = new MainConn();
    }
    return MainConn.instance;
  }

  initialize(canvas: fabric.Canvas, setMode: Function) {
    console.log('MainConn:initialize');
    this.setMode = setMode;
    this.canvas = canvas;
    const socket = io.connect('', {
      path: '/v1/socket.io/',
    });
    socket.on('connection:success', () => {
      console.log('MainConn: connection:success');
    });
    socket.on('tool:none', () => {
      console.log('MainConn: tool:none');
      setMode(Strategy.None);
    });
    socket.on('tool:pen', () => {
      console.log('MainConn: tool:pen');
      setMode(Strategy.FreeDrawing);
    });
    socket.on('tool:rect', () => {
      console.log('MainConn: tool:rect');
      setMode(Strategy.Rectangle);
    });
    socket.on('tool:oval', () => {
      console.log('MainConn: tool:oval');
      setMode(Strategy.Oval);
    });

    socket.on('action:undo', () => {
      console.log('MainConn: action:undo');
      History.getInstance().undo();
    });
    socket.on('action:redo', () => {
      console.log('MainConn: action:redo');
      History.getInstance().redo();
    });
    socket.on('action:clear', () => {
      console.log('MainConn: action:clear');
      this.canvas!.clear();
      History.getInstance().clear();
    });
    interface DrawData {
      type: string;
      value: string;
    }
    socket.on('draw', (data: DrawData) => {
      if (data.type === 'SHAPE') this.drawShape(data.value);
      else if (data.type === 'CLASS') this.drawClass(data.value);
      else this.drawText(data.value);
    });

    type ConnectDataType = { a: string; b: string };
    socket.on('action:connect', (data: ConnectDataType) => {
      this.connectClass(data.a, data.b);
    });
  }

  isClassObject = (object: fabric.Object, className: string) => {
    if (object instanceof fabric.Group) {
      let flag = false;
      object.forEachObject((obj) => {
        if (obj instanceof fabric.Text) {
          flag = obj.text === className;
        }
      });
      return flag;
    }
    return false;
  };

  findClassObject = (className: string) => {
    const objects = this.canvas!.getObjects();
    for (let i = 0; i < objects.length; ++i) {
      const obj = objects[i];
      if (this.isClassObject(obj, className)) {
        return obj;
      }
    }
    return null;
  };

  findEdgeMidPoints = (obj: fabric.Object) => {
    const left = obj.left!;
    const top = obj.top!;
    const width = obj.width!;
    const height = obj.height!;

    const horizontalMid = left + width / 2;
    const verticalMid = top + height / 2;

    const topMid = [ horizontalMid, top ];
    const botMid = [ horizontalMid, top + height ];

    const leftMid = [ left, verticalMid ];
    const rightMid = [ left + width, verticalMid ];

    return [ topMid, botMid, leftMid, rightMid ];
  };

  distance = (c1: number[], c2: number[]) => {
    const dy = c2[1] - c1[1];
    const dx = c2[0] - c1[0];

    return Math.sqrt(dy * dy + dx * dx);
  };

  findCloestLine = (aPoints: number[][], bPoints: number[][]) => {
    const closestPairIndex = [ 0, 0 ];
    let closestPairDistance = this.distance(aPoints[0], bPoints[0]);

    for (let i = 0; i < aPoints.length; ++i) {
      for (let j = 0; j < bPoints.length; ++j) {
        const currentDistance = this.distance(aPoints[i], bPoints[j]);
        if (currentDistance < closestPairDistance) {
          closestPairDistance = currentDistance;
          closestPairIndex[0] = i;
          closestPairIndex[1] = j;
        }
      }
    }

    return [ ...aPoints[closestPairIndex[0]], ...bPoints[closestPairIndex[1]] ];
  };

  connectClass = (a: string, b: string) => {
    const objA = this.findClassObject(a);
    const objB = this.findClassObject(b);

    if (objA === null) {
      message.warn(`Class ${a} not found!`);
    } else if (objB === null) {
      message.warn(`Class ${b} not found!`);
    } else {
      const aPoints = this.findEdgeMidPoints(objA);
      const bPoints = this.findEdgeMidPoints(objB);
      this.canvas!.add(
        new fabric.Line(this.findCloestLine(aPoints, bPoints), {
          stroke: 'black',
        })
      );
    }
  };

  drawText = (text: string) => {
    const textObject = new fabric.Text(text);
    const width = textObject.width;
    const height = textObject.height;
    const canvasWidth = this.canvas!.getWidth();
    const canvasHeight = this.canvas!.getHeight();

    textObject.left = (canvasWidth - width!) / 2;
    textObject.top = (canvasHeight - height!) / 2;

    this.canvas!.add(textObject);
  };

  drawShape = (shapeName: string) => {
    const width = this.canvas!.getWidth();
    const height = this.canvas!.getHeight();

    if (shapeName === 'RECTANGLE') {
      const rectangle = new fabric.Rect({
        left: width / 4,
        top: height / 4,
        width: width / 2,
        height: height / 2,
        angle: 0,
        fill: 'rgba(0, 0, 0, 0.0)',
        borderColor: 'rgba(0, 0, 0, 1)',
        hasBorders: true,
        stroke: 'black',
        strokeWidth: 1,
        transparentCorners: false,
        strokeUniform: true,
      });
      this.canvas!.add(rectangle);
    } else if (shapeName === 'CIRCLE') {
      const radius = Math.min(width / 4, height / 4);
      const ellipse = new fabric.Ellipse({
        left: (width - 2 * radius) / 2,
        top: (height - 2 * radius) / 2,
        rx: radius,
        ry: radius,
        angle: 0,
        fill: '',
        stroke: 'black',
        strokeWidth: 1,
        strokeUniform: true,
      });
      this.canvas!.add(ellipse);
    } else {
      const ellipse = new fabric.Ellipse({
        left: width / 4,
        top: height / 4,
        rx: width / 4,
        ry: height / 4,
        angle: 0,
        fill: '',
        stroke: 'black',
        strokeWidth: 1,
        strokeUniform: true,
      });
      this.canvas!.add(ellipse);
    }
    this.setMode!(Strategy.None);
  };

  drawClass = (className: string) => {
    if (this.findClassObject(className) !== null) {
      message.warn(`Class ${className} already exists!`);
      return;
    }

    const text = new fabric.Text(className, {
      fontSize: 24,
    });
    text.left = text.width;

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: text.width! * 3,
      height: text.height! * 9,
      angle: 0,
      fill: 'rgba(0, 0, 0, 0.0)',
      borderColor: 'rgba(0, 0, 0, 1)',
      hasBorders: true,
      stroke: 'black',
      strokeWidth: 1,
      transparentCorners: false,
      strokeUniform: true,
    });

    const line = new fabric.Line(
      [ 0, text.height!, text.width! * 3, text.height! ],
      {
        stroke: 'black',
        strokeWidth: 1,
        strokeUniform: true,
      }
    );

    const group = new fabric.Group([ text, rect, line ]);

    group.left = this.canvas!.getWidth() / 2 - group.width! / 2;
    group.top = this.canvas!.getHeight() / 2 - group.height! / 2;

    group.lockScalingFlip = true;

    this.canvas!.add(group);
    this.setMode!(Strategy.None);
  };
}
