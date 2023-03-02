import React, { Component, RefObject } from 'react';
import './App.css';
import { fabric } from 'fabric';
import * as M from 'materialize-css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faToolbox,
  faPen,
  faSquare,
  faTimesCircle,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import BaseStrategy from './tools/BaseStrategy';
import RectStrategy from './tools/RectStrategy';
import { Strategy } from './common/Strategy';
import OvalStrategy from './tools/OvalStrategy';
import History from './util/History';
import Header from './components/Header';
import { MainConn } from './util/main_conn';

export default class App extends Component {
  private canvas: fabric.Canvas | null = null;
  private strategy: BaseStrategy | null = null;
  private mode: Strategy = Strategy.None;
  private history: History | null = null;
  private headerRef = React.createRef() as RefObject<Header>;

  componentDidMount() {
    M.FloatingActionButton.init(
      document.querySelectorAll('.fixed-action-btn'),
      { hoverEnabled: false }
    );

    const canvas = new fabric.Canvas('main-canvas');

    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight - 50);
    this.canvas = canvas;
    this.bindEvents();
    this.history = History.getInstance();
    this.history.initialize(this.canvas);

    MainConn.getInstance().initialize(this.canvas, this.setMode.bind(this));
  }

  bindEvents() {
    this.canvas!.on('mouse:down', (e: fabric.IEvent) => {
      if (this.strategy != null) {
        this.strategy.onMouseDown(e);
      }
    });
    this.canvas!.on('mouse:move', (e: fabric.IEvent) => {
      if (this.strategy != null) {
        this.strategy.onMouseMove(e);
      }
    });
    this.canvas!.on('mouse:up', (e: fabric.IEvent) => {
      if (this.strategy != null) {
        this.strategy.onMouseUp(e);
      }
    });
  }

  setMode(mode: Strategy) {
    if (this.mode === mode) {
      this.mode = Strategy.None;
    } else {
      this.mode = mode;
    }

    this.headerRef.current!.setStrategy(this.mode);

    if (this.mode === Strategy.None) {
      this.canvas!.isDrawingMode = false;
      this.canvas!.selection = true;
      this.canvas!.forEachObject((object: fabric.Object) => {
        object.selectable = true;
      });
      this.strategy = null;
    } else {
      this.canvas!.selection = false;
      this.canvas!.forEachObject((object: fabric.Object) => {
        object.selectable = false;
      });
    }

    switch (this.mode) {
      case Strategy.FreeDrawing: {
        this.canvas!.isDrawingMode = true;
        this.strategy = null;
        break;
      }
      case Strategy.Rectangle: {
        this.canvas!.isDrawingMode = false;
        this.strategy = new RectStrategy(this.canvas!);
        break;
      }
      case Strategy.Oval: {
        this.canvas!.isDrawingMode = false;
        this.strategy = new OvalStrategy(this.canvas!);
        break;
      }
    }
  }

  render() {
    return (
      <div>
        <Header ref={this.headerRef} setMode={this.setMode} />
        <canvas id='main-canvas' />
        <div className='fixed-action-btn'>
          <button
            className='btn-floating btn-large red'
            onDoubleClick={() => {
              this.setMode(Strategy.None);
            }}
          >
            <FontAwesomeIcon icon={faToolbox} />
          </button>
          <ul>
            <li>
              <button
                className='btn-floating red'
                onClick={() => this.setMode(Strategy.FreeDrawing)}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
            </li>
            <li>
              <button
                className='btn-floating yellow darken-1'
                onClick={() => {
                  this.setMode(Strategy.Rectangle);
                }}
              >
                <FontAwesomeIcon icon={faSquare} />
              </button>
            </li>
            <li>
              <button
                className='btn-floating green darken-1'
                onClick={() => {
                  this.setMode(Strategy.Oval);
                }}
              >
                <FontAwesomeIcon icon={faCircle} />
              </button>
            </li>
            <li>
              <button
                className='btn-floating red'
                onClick={() => {
                  this.canvas!.clear();
                  History.getInstance().clear();
                }}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
