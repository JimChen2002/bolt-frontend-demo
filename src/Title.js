import React from 'react';
import { InfoSidebar } from './UserAction';

import './Title.css';

export function Title(props) {
  return (
    <div className="title-bar">
      <div className="title">
        <p>
          <span>
            {process.env.REACT_APP_TITLE}
          </span>
        </p>
      </div>
    </div>
  );
}
