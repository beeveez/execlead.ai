/**
 * EXEC™ Intelligent Magnetic Cursor — Visual Component
 *
 * Renders the outer ring + inner core + contextual hover label.
 * Uses rAF + refs for 60fps GPU-accelerated movement (no React re-renders per frame).
 * State changes (hover, click, AI states) use React state (infrequent).
 *
 * Features:
 *   • Smooth spring-like interpolation
 *   • Magnetic attraction to interactive elements
 *   • Adaptive visibility (mix-blend-mode or workspace colors)
 *   • Contextual hover labels (data-cursor-label or inferred)
 *   • Cursor states (hover, click, AI processing, success, error)
 *   • Workspace-aware colors
 *   • Label edge detection (flips near screen edges)
 */

import React, { useRef, useEffect, useState } from 'react';
import { useEXECursor, WORKSPACE_COLORS, STRENGTH_MAP, SIZE_MAP, SPEED_MAP } from '@/lib/EXECursorContext';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], [role="tab"], [data-cursor-label], .cursor-magnetic, summary, [data-cursor-state]';

const AI_STATES = new Set(['loading', 'thinking', 'analyzing', 'synchronizing', 'generating', 'reasoning', 'searching', 'validating']);

function inferLabel(el) {
  const explicit = el.getAttribute('data-cursor-label');
  if (explicit) return explicit;
  const text = (el.textContent || '').trim().toLowerCase();
  if (/delete|remove|trash/.test(text)) return 'Delete';
  if (/edit|modify/.test(text)) return 'Edit';
  if (/create|add new|new /.test(text)) return 'Create';
  if (/approve/.test(text)) return 'Approve';
  if (/reject|decline/.test(text)) return 'Reject';
  if (/run|execute/.test(text)) return 'Run';
  if (/sync|synchronize/.test(text)) return 'Sync';
  if (/export|download/.test(text)) return 'Export';
  if (/import|upload/.test(text)) return 'Import';
  if (/search|find/.test(text)) return 'Search';
  if (/settings|config/.test(text)) return 'Settings';
  if (/compare/.test(text)) return 'Compare';
  if (/launch/.test(text)) return 'Launch';
  if (/assign/.test(text)) return 'Assign';
  if (/complete|done|finish/.test(text)) return 'Complete';
  if (/review/.test(text)) return 'Review';
  if (/analyze/.test(text)) return 'Analyze';
  if (/drill.?down|details|view|open/.test(text)) return 'View';
  if (el.tagName === 'A') return 'Open';
  return null;
}

export default function EXECursor() {
  const ctx = useEXECursor();
  const ringPosRef = useRef(null);
  const corePosRef = useRef(null);
  const labelRef = useRef(null);

  const mouseRef = useRef({ x: -100, y: -100 });
  const cursorRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const hoverElRef = useRef(null);
  const rafRef = useRef(0);

  const [ui, setUi] = useState({ hovering: false, clicking: false, hoverState: null, label: null, customColor: null });

  const settings = ctx?.settings;
  const isDisabled = !ctx || !settings?.enabled || ctx.isTouchDevice || ctx.prefersReducedMotion;

  useEffect(() => {
    if (isDisabled || !settings) return;

    const lerp = SPEED_MAP[settings.animationSpeed] ?? 0.18;
    const magnet = STRENGTH_MAP[settings.magneticStrength] ?? 0.18;

    document.body.classList.add('exec-cursor-active');

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!hoverElRef.current) targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e) => {
      const el = e.target.closest?.(INTERACTIVE_SELECTOR);
      if (el && el !== hoverElRef.current) {
        hoverElRef.current = el;
        const hoverLabel = settings.hoverLabels ? inferLabel(el) : null;
        const hoverState = el.getAttribute('data-cursor-state') || 'hover';
        const customColor = el.getAttribute('data-cursor-color');
        setUi(prev => ({ ...prev, hovering: true, hoverState, label: hoverLabel, customColor }));
      }
    };

    const onMouseOut = (e) => {
      if (!hoverElRef.current) return;
      const toEl = e.relatedTarget;
      if (!toEl || !toEl.closest?.(INTERACTIVE_SELECTOR)) {
        hoverElRef.current = null;
        setUi(prev => ({ ...prev, hovering: false, hoverState: null, label: null, customColor: null }));
      }
    };

    const onMouseDown = () => setUi(prev => ({ ...prev, clicking: true }));
    const onMouseUp = () => setUi(prev => ({ ...prev, clicking: false }));

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('mousedown', onMouseDown, { passive: true });
    document.addEventListener('mouseup', onMouseUp, { passive: true });

    const animate = () => {
      if (hoverElRef.current) {
        const rect = hoverElRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mouseRef.current.x;
        const dy = cy - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(rect.width, rect.height) * 0.9;
        if (dist < maxDist) {
          const f = magnet * (1 - dist / maxDist);
          targetRef.current = { x: mouseRef.current.x + dx * f, y: mouseRef.current.y + dy * f };
        } else {
          targetRef.current = { ...mouseRef.current };
        }
      } else {
        targetRef.current = { ...mouseRef.current };
      }

      cursorRef.current.x += (targetRef.current.x - cursorRef.current.x) * lerp;
      cursorRef.current.y += (targetRef.current.y - cursorRef.current.y) * lerp;

      const x = cursorRef.current.x;
      const y = cursorRef.current.y;

      if (ringPosRef.current) ringPosRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (corePosRef.current) corePosRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (labelRef.current) {
        const flipX = x + 200 > window.innerWidth;
        const flipY = y + 40 > window.innerHeight;
        const lx = flipX ? x - 18 : x + 18;
        const ly = flipY ? y - 30 : y + 18;
        labelRef.current.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('exec-cursor-active');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isDisabled, settings]);

  if (isDisabled || !settings) return null;

  const ringSize = SIZE_MAP[settings.cursorSize] ?? 26;
  const useWsColors = settings.workspaceColors;
  const wsColor = ui.customColor || (useWsColors ? (ctx.workspaceColor || WORKSPACE_COLORS.executive) : '#ffffff');
  const useBlend = !useWsColors && !ui.customColor;

  // Determine effective state
  const progState = ctx.cursorState && ctx.cursorState !== 'default' ? ctx.cursorState : null;
  const effectiveState = progState || (ui.clicking ? 'click' : ui.hovering ? (ui.hoverState || 'hover') : 'default');
  const isSpinning = AI_STATES.has(effectiveState);

  // Ring scale
  let ringScale = 1;
  if (effectiveState === 'hover') ringScale = 1.8;
  else if (effectiveState === 'click') ringScale = 0.55;
  else if (effectiveState === 'success') ringScale = 1.5;
  else if (effectiveState === 'error' || effectiveState === 'critical') ringScale = 1.4;
  else if (effectiveState === 'warning') ringScale = 1.3;
  else if (isSpinning) ringScale = 1.2;

  // Core scale
  let coreScale = 1;
  if (effectiveState === 'hover') coreScale = 0.6;
  else if (effectiveState === 'click') coreScale = 2;
  else if (isSpinning) coreScale = 0.5;

  // State color
  let stateColor = wsColor;
  if (effectiveState === 'success') stateColor = '#10b981';
  else if (effectiveState === 'warning') stateColor = '#f59e0b';
  else if (effectiveState === 'error' || effectiveState === 'critical') stateColor = '#ef4444';

  // Label
  const aiLabel = isSpinning ? effectiveState.charAt(0).toUpperCase() + effectiveState.slice(1) + '…' : null;
  const displayLabel = ctx.label || ui.label || aiLabel;

  const ringStyle = {
    width: ringSize, height: ringSize, borderRadius: '50%',
    border: `1.5px ${isSpinning ? 'dashed' : 'solid'} ${stateColor}`,
    transition: 'width 0.2s, height 0.2s, border-color 0.2s',
    mixBlendMode: useBlend ? 'difference' : 'normal',
    boxShadow: useWsColors || ui.customColor ? `0 0 12px ${stateColor}55` : 'none',
    opacity: effectiveState === 'disabled' ? 0.4 : 1,
  };

  const coreStyle = {
    width: 6, height: 6, borderRadius: '50%', background: stateColor,
    transition: 'background 0.2s',
    mixBlendMode: useBlend ? 'difference' : 'normal',
    boxShadow: useWsColors || ui.customColor ? `0 0 8px ${stateColor}99` : 'none',
  };

  return (
    <>
      {/* Outer Ring */}
      <div ref={ringPosRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999, willChange: 'transform' }}>
        <div style={{ transform: `translate(-50%, -50%) scale(${ringScale})`, transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className={isSpinning ? 'exec-cursor-spin' : ''} style={ringStyle} />
        </div>
      </div>

      {/* Inner Core */}
      <div ref={corePosRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999, willChange: 'transform' }}>
        <div style={{ transform: `translate(-50%, -50%) scale(${coreScale})`, transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={coreStyle} />
        </div>
      </div>

      {/* Hover Label */}
      {displayLabel && (
        <div
          ref={labelRef}
          className="animate-fade-in"
          style={{
            position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999, willChange: 'transform',
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(13, 13, 20, 0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          }}
        >
          {displayLabel}
        </div>
      )}
    </>
  );
}