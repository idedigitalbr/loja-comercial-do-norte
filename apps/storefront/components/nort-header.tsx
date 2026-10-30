'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Compass, MessageCircle, X } from 'lucide-react';
import { useNortTour } from './tour';
import { nortFrameAt, NORT_LOOP_SECONDS } from './nort-timeline';
import styles from './nort-header.module.css';

const HOVER_DELAY_MS = 4000;

export function NortHeader() {
  const { startTour } = useNortTour();
  const [seconds, setSeconds] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const id = useId();

  const open = manualOpen;
  const frame = manualOpen ? 40 : nortFrameAt(seconds);

  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.25);
      last = now;
      if (document.hidden) return;

      setSeconds((value) => {
        if (manualOpen) return 28;
        return (value + delta) % NORT_LOOP_SECONDS;
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [manualOpen]);

  function clearHoverTimer() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function startHoverTimer() {
    if (manualOpen) return;
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => {
      invite();
      hoverTimer.current = null;
    }, HOVER_DELAY_MS);
  }

  function invite() {
    clearHoverTimer();
    setSeconds(28);
    setManualOpen(true);
  }

  function dismiss() {
    clearHoverTimer();
    setManualOpen(false);
    setSeconds(37);
  }

  useEffect(() => {
    return () => {
      clearHoverTimer();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) dismiss();
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (root.current?.contains(document.activeElement)) trigger.current?.focus();
      dismiss();
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  function close() {
    trigger.current?.focus();
    dismiss();
  }

  return (
    <div
      ref={root}
      id="tour-header-nort"
      className={styles.root}
      data-open={open}
      onFocus={(event) => {
        if ((event.target as Node) !== trigger.current) invite();
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') startHoverTimer();
      }}
      onPointerLeave={() => {
        clearHoverTimer();
        if (manualOpen && !root.current?.contains(document.activeElement)) dismiss();
      }}
      onBlur={(event) => {
        clearHoverTimer();
        if (!event.currentTarget.contains(event.relatedTarget)) dismiss();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-label="Conversar com o Nort"
        aria-expanded={open}
        aria-controls={id}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) invite();
        }}
        onClick={() => {
          if (manualOpen) {
            dismiss();
          } else {
            invite();
          }
        }}
      >
        <span className={styles.character}>
          <span
            role="img"
            aria-label="Nort, mascote da Comercial do Norte"
            className={styles.sprite}
            style={{
              backgroundPosition: `${((frame % 8) * 100) / 7}% ${(Math.floor(frame / 8) * 100) / 7}%`,
            }}
          />
        </span>
      </button>

      {open && (
        <div className={styles.bubbleWrap}>
          <section id={id} aria-label="Ajuda do Nort" className={styles.bubble}>
            <button
              type="button"
              aria-label="Fechar ajuda do Nort"
              className={styles.close}
              onClick={close}
            >
              <X size={16} />
            </button>
            <p className={styles.greeting}>Oi! Eu sou o Nort! 👋</p>
            <p className={styles.question}>Como posso te ajudar?</p>
            <button
              type="button"
              onClick={() => {
                close();
                startTour();
              }}
              className={styles.action}
            >
              <Compass size={19} aria-hidden="true" />
              <span>Ver tour guiado novamente</span>
            </button>
            <a
              href="#"
              onClick={(event) => event.preventDefault()}
              className={styles.action}
            >
              <MessageCircle size={19} aria-hidden="true" />
              <span>Falar com o Nort</span>
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
