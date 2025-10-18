"use client";
import React, { useState } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const defaultStyle: React.CSSProperties = {
  transition: 'box-shadow 0.2s, transform 0.2s',
  background: '#f8fafd',
  cursor: 'pointer',
};

export default function InteractiveCard({ children, className = '', style = {} }: InteractiveCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`card border-0 shadow-sm ${className}`}
      style={{
        ...defaultStyle,
        ...style,
        boxShadow: hover ? '0 4px 24px rgba(26,35,126,0.08)' : undefined,
        transform: hover ? 'translateY(-2px)' : undefined,
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {children}
    </div>
  );
}
