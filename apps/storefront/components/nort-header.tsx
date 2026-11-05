'use client';

import { useEffect, useState } from 'react';
import { nortFrameAt, NORT_LOOP_SECONDS } from './nort-timeline';
import styles from './nort-header.module.css';

export function NortHeader() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.25);
      last = now;
      if (document.hidden) return;

      setSeconds((value) => (value + delta) % NORT_LOOP_SECONDS);
    }, 80);

    return () => window.clearInterval(timer);
  }, []);

  const frame = nortFrameAt(seconds);

  return (
    <div
      id="tour-header-nort"
      className={styles.root}
      aria-label="Nort, mascote da Comercial do Norte"
      role="img"
    >
      <div className={styles.characterContainer}>
        <span className={styles.character}>
          <span
            className={styles.sprite}
            style={{
              backgroundPosition: `${((frame % 8) * 100) / 7}% ${(Math.floor(frame / 8) * 100) / 7}%`,
            }}
          />
        </span>
      </div>
    </div>
  );
}
