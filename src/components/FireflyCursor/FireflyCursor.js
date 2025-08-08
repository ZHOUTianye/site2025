import React, { useEffect, useState, useRef } from 'react';
import './FireflyCursor.css';

const MAX_TRAIL = 20;
const IDLE_TIMEOUT = 50;
const BASE_SIZE = 8; // cursor size while moving
const IDLE_SIZE = 16; // cursor size when idle
const INTERACTIVE_SIZE = 24; // size when hovering clickable areas
const MIN_STEP = 2; // minimum growth between rings
const MAX_STEP = 5; // cap growth for very fast movement
const SWARM_COUNT = 6; // number of trailing groups rendered as swarm
const MAX_SIZE = 40;

// Determine if a color is dark; treat fully transparent colors as light
function isColorDark(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
  if (!match) return false;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  if (a === 0) return false;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
}

// Traverse up the DOM tree to find the first non-transparent background color
function getEffectiveBackgroundColor(element) {
  let el = element;
  while (el) {
    const bg = window.getComputedStyle(el).backgroundColor;
    const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/i);
    if (match) {
      const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
      if (alpha > 0) {
        return bg;
      }
    } else if (bg && bg !== 'transparent') {
      return bg;
    }
    el = el.parentElement;
  }
  return 'rgb(255,255,255)';
}

function FireflyCursor() {
  const [trail, setTrail] = useState([]);
  const [step, setStep] = useState(MIN_STEP);
  const [idle, setIdle] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const idleTimer = useRef(null);

  // 非 Chrome 浏览器隐藏系统指针：通过类名控制样式
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isChrome = /chrome\//.test(ua) && !/edg\//.test(ua) && !/opr\//.test(ua);
    if (!isChrome) {
      document.documentElement.classList.add('hide-native-cursor');
    } else {
      document.documentElement.classList.remove('hide-native-cursor');
    }
    return () => {
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      let bg = 'rgb(255,255,255)';
      if (element) {
        bg = getEffectiveBackgroundColor(element);
      }
      let isDark = isColorDark(bg);

      // Special handling for Personality page's half white/half black section
      const personalityBg = document.querySelector('.all-sticky-content');
      if (personalityBg) {
        const rect = personalityBg.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const relativeY = e.clientY - rect.top;
          isDark = relativeY > rect.height / 2;
        }
      }

      const clickable = element && (
        element.closest('.swiper-slide') ||
        element.closest('.story-swiper-container') ||
        element.closest('.thumbnail-item') ||
        element.closest('.main-image')
      );
      setInteractive(!!clickable);

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const distance = Math.hypot(dx, dy);
      const newStep = Math.min(MAX_STEP, MIN_STEP + distance * 0.25);
      setStep(newStep);
      lastPos.current = { x: e.clientX, y: e.clientY };

      setTrail(prev => {
        const point = { x: e.clientX, y: e.clientY, dark: isDark };
        if (clickable) {
          return [point];
        }
        if (isDark) {
          return [point, ...prev].slice(0, MAX_TRAIL);
        }
        return [point];
      });

      setIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setTrail(prev => prev.slice(0, 1));
        setIdle(true);
      }, IDLE_TIMEOUT);
    };

    const handleMouseOut = (e) => {
      // 当鼠标离开窗口（relatedTarget 为 null）时，隐藏自定义指针
      if (!e.relatedTarget) {
        setTrail([]);
        setIdle(true);
      }
    };

    const handleWindowBlur = () => {
      // 页面失焦（切换标签或最小化）时隐藏
      setTrail([]);
      setIdle(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTrail([]);
        setIdle(true);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  if (trail.length === 0) return null;

  return (
    <div className="firefly-container">
      {trail.map((p, idx) => {
        const baseSize = interactive
          ? INTERACTIVE_SIZE
          : idle && idx === 0
            ? IDLE_SIZE
            : BASE_SIZE;
        const rawSize = baseSize + idx * step;
        const size = Math.min(rawSize, MAX_SIZE);
        const opacity = 1 - idx / MAX_TRAIL;
        const isSwarm = !interactive && p.dark && idx >= trail.length - SWARM_COUNT && idx !== 0;
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