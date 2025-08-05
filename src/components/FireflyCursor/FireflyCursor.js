import React, { useEffect, useState, useRef } from 'react';
import './FireflyCursor.css';

const MAX_TRAIL = 20;
const IDLE_TIMEOUT = 50;
const BASE_SIZE = 8; // cursor size while moving
const IDLE_SIZE = 16; // cursor size when idle
const MIN_STEP = 2; // minimum growth between rings
const MAX_STEP = 5; // cap growth for very fast movement
const SWARM_COUNT = 6; // number of trailing groups rendered as swarm
const MAX_SIZE = 40;

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
  const [step, setStep] = useState(MIN_STEP);
  const [idle, setIdle] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const idleTimer = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      let bg = 'rgb(255,255,255)';
      if (element) {
        bg = window.getComputedStyle(element).backgroundColor;
      }
      const isDark = isColorDark(bg);

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const distance = Math.hypot(dx, dy);
      const newStep = Math.min(MAX_STEP, MIN_STEP + distance * 0.25);
      setStep(newStep);
      lastPos.current = { x: e.clientX, y: e.clientY };

      setTrail(prev => {
        const next = [{ x: e.clientX, y: e.clientY, dark: isDark }, ...(isDark ? prev : [])];
        return next.slice(0, isDark ? MAX_TRAIL : 1);
      });

      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setTrail(prev => prev.slice(0, 1));
        setIdle(true);
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
        const baseSize = idle && idx === 0 ? IDLE_SIZE : BASE_SIZE;
        const rawSize = baseSize + idx * step;
        const size = Math.min(rawSize, MAX_SIZE);
        const opacity = 1 - idx / MAX_TRAIL;
        const isSwarm = p.dark && idx >= trail.length - SWARM_COUNT && idx !== 0;
        if (isSwarm) {
          const dots = Array.from({ length: 5 });
          return (
            <div
              key={idx}
              className="firefly-swarm"
              style={{ left: p.x, top: p.y, width: size, height: size, opacity }}
            >
              {dots.map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const radius = (size / 2) * Math.random();
                const x = radius * Math.cos(angle) + size / 2;
                const y = radius * Math.sin(angle) + size / 2;
                return (
                  <div
                    key={i}
                    className="firefly-swarm-dot"
                    style={{ left: x, top: y }}
                  />
                );
              })}
            </div>
          );
        }
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