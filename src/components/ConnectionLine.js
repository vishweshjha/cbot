import React from 'react';

export default ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineType,
  connectionLineStyle,
}) => {
  return (
    <g>
      <path
        fill="none"
        stroke="#333"
        strokeWidth={3}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#333" strokeWidth={4} />
    </g>
  );
};
