import React from 'react';

interface BasketballIconProps {
  className?: string;
  size?: number;
}

export const BasketballIcon: React.FC<BasketballIconProps> = ({
  className = 'w-6 h-6',
}) => {
  return (
    <img
      src="/basketball.png"
      alt="Basketball"
      className={`inline-block select-none pointer-events-none object-contain ${className}`}
      draggable={false}
    />
  );
};
