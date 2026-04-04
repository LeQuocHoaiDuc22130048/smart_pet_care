import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled = false,
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<number[]>(
    () => defaultValue ?? [min, max]
  );

  const vals = isControlled ? (value ?? [min, max]) : internalValue;

  // Keep all mutable state in refs so event listeners always see latest values
  const stateRef = React.useRef({
    vals,
    min,
    max,
    step,
    isControlled,
    onValueChange,
    setInternalValue,
  });
  stateRef.current = { vals, min, max, step, isControlled, onValueChange, setInternalValue };

  const trackRef = React.useRef<HTMLDivElement>(null);
  const draggingIndex = React.useRef<number | null>(null);

  const getValueFromClientX = React.useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return stateRef.current.min;
    const { min: mn, max: mx, step: st } = stateRef.current;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = mn + ratio * (mx - mn);
    const snapped = Math.round((raw - mn) / st) * st + mn;
    return Math.min(mx, Math.max(mn, snapped));
  }, []);

  const commitValue = React.useCallback((clientX: number) => {
    const idx = draggingIndex.current;
    if (idx === null) return;
    const { vals: current, isControlled: ctrl, setInternalValue: setVal, onValueChange: cb } = stateRef.current;
    const newVal = getValueFromClientX(clientX);
    const next = [...current];
    next[idx] = newVal;
    if (next.length === 2) {
      if (idx === 0) next[0] = Math.min(next[0], next[1]);
      if (idx === 1) next[1] = Math.max(next[1], next[0]);
    }
    if (!ctrl) setVal(next);
    cb?.(next);
  }, [getValueFromClientX]);

  const startDrag = React.useCallback((idx: number) => (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    draggingIndex.current = idx;
    document.body.style.userSelect = 'none';

    if ('touches' in e) {
      const onTouchMove = (te: TouchEvent) => {
        te.preventDefault();
        commitValue(te.touches[0].clientX);
      };
      const onTouchEnd = () => {
        draggingIndex.current = null;
        document.body.style.userSelect = '';
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    } else {
      const onMouseMove = (me: MouseEvent) => {
        me.preventDefault();
        commitValue(me.clientX);
      };
      const onMouseUp = () => {
        draggingIndex.current = null;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }, [disabled, commitValue]);

  const onTrackMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    if ((e.target as HTMLElement).getAttribute('role') === 'slider') return;
    const { vals: current, isControlled: ctrl, setInternalValue: setVal, onValueChange: cb } = stateRef.current;
    const clickVal = getValueFromClientX(e.clientX);
    const next = [...current];
    if (next.length === 1) {
      next[0] = clickVal;
    } else {
      const d0 = Math.abs(current[0] - clickVal);
      const d1 = Math.abs(current[1] - clickVal);
      const idx = d0 <= d1 ? 0 : 1;
      next[idx] = clickVal;
      if (idx === 0) next[0] = Math.min(next[0], next[1]);
      if (idx === 1) next[1] = Math.max(next[1], next[0]);
    }
    if (!ctrl) setVal(next);
    cb?.(next);
  }, [disabled, getValueFromClientX]);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const rangeLeft = vals.length >= 2 ? pct(vals[0]) : 0;
  const rangeRight = vals.length >= 2 ? 100 - pct(vals[1]) : 100 - pct(vals[0]);

  return (
    <div className={cn('relative flex w-full items-center py-3', disabled && 'opacity-50 pointer-events-none', className)}>
      {/* Track */}
      <div
        ref={trackRef}
        className='relative h-2 w-full rounded-full bg-muted cursor-pointer'
        onMouseDown={onTrackMouseDown}
      >
        {/* Active range fill */}
        <div
          className='absolute h-full rounded-full bg-[#448B3D] pointer-events-none'
          style={{ left: `${rangeLeft}%`, right: `${rangeRight}%` }}
        />
      </div>

      {/* Thumbs */}
      {vals.map((v, i) => (
        <div
          key={i}
          role='slider'
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={v}
          tabIndex={disabled ? -1 : 0}
          className='absolute size-5 rounded-full border-2 border-[#448B3D] bg-white shadow-md ring-[#448B3D]/30 hover:ring-4 focus-visible:ring-4 focus-visible:outline-none transition-shadow cursor-grab active:cursor-grabbing z-10'
          style={{ left: `calc(${pct(v)}% - 10px)` }}
          onMouseDown={startDrag(i)}
          onTouchStart={startDrag(i)}
          onKeyDown={e => {
            if (disabled) return;
            const { vals: cur, min: mn, max: mx, step: st, isControlled: ctrl, setInternalValue: setVal, onValueChange: cb } = stateRef.current;
            let next = [...cur];
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next[i] = Math.min(mx, Math.max(mn, Math.round((v + st - mn) / st) * st + mn));
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next[i] = Math.min(mx, Math.max(mn, Math.round((v - st - mn) / st) * st + mn));
            else return;
            e.preventDefault();
            if (next.length === 2) {
              if (i === 0) next[0] = Math.min(next[0], next[1]);
              if (i === 1) next[1] = Math.max(next[1], next[0]);
            }
            if (!ctrl) setVal(next);
            cb?.(next);
          }}
        />
      ))}
    </div>
  );
}

export { Slider };
