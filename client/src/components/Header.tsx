import React from 'react';
import History from '../util/History';
import { faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.css';
import { Strategy } from '../common/Strategy';

interface HeaderProps {
    setMode: Function;
}

interface HeaderState {
  mode: Strategy;
}
export default class Header extends React.Component<HeaderProps, HeaderState> {
  state = {
    mode: Strategy.None,
  };

  setStrategy(mode: Strategy) {
    this.setState({ mode });
  }

  getDisplayText() {
    switch (this.state.mode) {
      case Strategy.None:
        return 'No Tool Selected';
      case Strategy.FreeDrawing:
        return 'Pen Tool';
      case Strategy.Rectangle:
        return 'Rect Tool';
      case Strategy.Oval:
        return 'Oval Tool';
    }
  }

  render() {
    return (
      <div id='header' className='z-depth-2 orange'>
        <p className='white-text'>
          <strong>{this.getDisplayText()}</strong>
        </p>
        <div id='actions'>
          <button
            className='blue lighten-1 waves-effect waves-light btn-floating'
            onClick={() => {
              History.getInstance().undo();
            }}
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className='teal lighten-1 waves-effect waves-light btn-floating'
            onClick={() => {
              History.getInstance().redo();
            }}
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
      </div>
    );
  }
}
