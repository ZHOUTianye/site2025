import React, { useEffect, useState, useRef } from 'react';
import './FireflyCursor.css';

const MAX_TRAIL = 12;
const IDLE_TIMEOUT = 120;

function isColorDark(color) {
  const match = color.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return false;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  // perceived luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
}

function FireflyCursor() {
  const [trail, setTrail] = useState([]);
  const idleTimer = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      let bg = 'rgb(255,255,255)';
      if (element) {
        bg = window.getComputedStyle(element).backgroundColor;
      }
      const isDark = isColorDark(bg);
      setTrail(prev => {
        const next = [{ x: e.clientX, y: e.clientY, dark: isDark }, ...(isDark ? prev : [])];
        return next.slice(0, isDark ? MAX_TRAIL : 1);
      });

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setTrail(prev => prev.slice(0, 1));
      }, IDLE_TIMEOUT);
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  if (trail.length === 0) return null;

  return (
    <div className="firefly-container">
      {trail.map((p, idx) => {
        const size = 8 + idx * 6;
        const opacity = 1 - idx / MAX_TRAIL;
        return (
          <div
            key={idx}
            className={`firefly-dot ${p.dark ? 'dark' : 'light'}`}
            style={{
              left: p.x,
              top: p.y,
              width: size,
              height: size,
              opacity
            }}
          />
        );
      })}
    </div>
  );
}

export default FireflyCursor;