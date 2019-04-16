import React from 'react';

export const Loading = (props) => {
  return (
    <div className="loading-container">
      <div className="ripple-loader"></div>
      <span>{props.msg}</span>
    </div>
  )
}