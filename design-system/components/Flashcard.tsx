import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

/**
 * Vocabulary flashcard.
 *
 * ANATOMY
 *   ┌───────────────────────────┐   perspective on the wrapper
 *   │ ┌───────────────────────┐ │   rotateY on the inner
 *   │ │  front face           │ │   both faces stacked in one grid cell, so
 *   │ │  (back face behind,   │ │   the card never changes size mid-flip
 *   │ │   rotated 180deg)     │ │
 *   │ └───────────────────────┘ │
 *   └───────────────────────────┘
 *
 * ONE OF ONLY THREE PLACES WITH JS MOTION
 * Drag-to-flip needs pointer tracking; nothing else here does. The tap path is
 * pure CSS — the JS only sets `--flip` while a drag is in progress.
 *
 * LEGIBILITY MID-TRANSITION
 * `backface-visibility: hidden` means exactly one face is ever readable, and
 * the swap happens at 90deg where both are edge-on. Without it you get a
 * mirrored ghost of the reverse face bleeding through, which at vocabulary
 * sizes is genuinely unreadable.
 */

const FLIP_VELOCITY_THRESHOLD = 0.35; // px per ms
const FLIP_DISTANCE_THRESHOLD = 0.25; // fraction of card width

export interface FlashcardProps {
  front: ReactNode;
  back: ReactNode;
  /** Accessible name, e.g. the word itself. */
  label: string;
}

export function Flashcard({ front, back, label }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startTime: 0, width: 1 });

  function setFlip(deg: number) {
    innerRef.current?.style.setProperty('--flip', deg + 'deg');
  }

  function commit(next: boolean) {
    setFlipped(next);
    setDragging(false);
    setFlip(next ? 180 : 0);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    // Mouse users get tap-to-flip; only touch and pen drag.
    if (event.pointerType === 'mouse') return;
    const element = event.currentTarget;
    element.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      startTime: performance.now(),
      width: element.getBoundingClientRect().width || 1,
    };
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - drag.current.startX;
    const fraction = Math.max(-1, Math.min(1, dx / drag.current.width));
    const base = flipped ? 180 : 0;
    setFlip(base + fraction * 180);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - drag.current.startX;
    const dt = Math.max(1, performance.now() - drag.current.startTime);
    const velocity = Math.abs(dx) / dt;
    const fraction = Math.abs(dx) / drag.current.width;
    // Either a decisive flick or a deliberate drag past a quarter of the card.
    const shouldFlip = velocity > FLIP_VELOCITY_THRESHOLD || fraction > FLIP_DISTANCE_THRESHOLD;
    commit(shouldFlip ? !flipped : flipped);
  }

  return (
    <div className="vlm-flashcard" data-face={flipped ? 'back' : 'front'}>
      <button
        type="button"
        className="focus-ring block w-full text-left"
        aria-pressed={flipped}
        aria-label={`${label}. ${flipped ? 'Showing definition' : 'Showing word'}. Activate to flip.`}
        onClick={() => commit(!flipped)}
      >
        <div
          ref={innerRef}
          className="vlm-flashcard__inner"
          data-dragging={dragging || undefined}
          style={{ ['--flip' as string]: flipped ? '180deg' : '0deg' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => commit(flipped)}
        >
          <div className="vlm-flashcard__face vlm-flashcard__face--front elevated grid min-h-56 place-items-center p-6">
            {front}
          </div>
          <div className="vlm-flashcard__face vlm-flashcard__face--back elevated grid min-h-56 place-items-center p-6">
            {back}
          </div>
        </div>
      </button>

      {/* Both faces exist in the DOM at all times, so a screen reader can read
          either. The live region announces which one is showing. */}
      <span aria-live="polite" className="sr-only">
        {flipped ? 'Definition' : 'Word'}
      </span>
    </div>
  );
}
