'use client';

import { useEffect, useState } from 'react';

const PHONE = '77024751703';
const MESSAGE = 'Здравствуйте! Хочу узнать о наличии и ценах на товары Synteco';
const HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

/** Timings, in ms: the dock springs in, then a one-shot invite card appears
 *  and retires on its own so it never becomes wallpaper the eye filters out. */
const APPEAR_DELAY = 900;
const CARD_DELAY = 6000;
const CARD_LIFETIME = 14000;

export function WhatsAppButton() {
  const [shown, setShown] = useState(false);
  const [card, setCard] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShown(true), APPEAR_DELAY);
    const t2 = setTimeout(() => setCard(true), CARD_DELAY);
    const t3 = setTimeout(() => setCard(false), CARD_DELAY + CARD_LIFETIME);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const open = card && !closed;

  return (
    <div className={`wa-dock${shown ? ' is-shown' : ''}`}>
      <div className={`wa-card${open ? ' is-open' : ''}`}>
        <button
          type="button"
          className="wa-card-x"
          onClick={() => { setClosed(true); setCard(false); }}
          aria-label="Закрыть подсказку"
          tabIndex={open ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <a
          href={HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-card-body"
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
        >
          <span className="wa-card-head">
            <span className="wa-card-avatar" aria-hidden="true">S</span>
            <span className="wa-card-who">
              <strong>Synteco</strong>
              <em><i className="wa-live" aria-hidden="true" />онлайн · отвечаем за пару минут</em>
            </span>
          </span>
          <span className="wa-card-text">Подберём товар, проверим наличие и пришлём КП в WhatsApp.</span>
          <span className="wa-card-cta">Написать в WhatsApp</span>
        </a>
      </div>

      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в WhatsApp"
        title="Написать в WhatsApp"
        className="wa-fab"
      >
        <span className="wa-halo" aria-hidden="true" />
        <span className="wa-halo wa-halo--b" aria-hidden="true" />
        <span className="wa-label">Написать в WhatsApp</span>
        <span className="wa-core" aria-hidden="true">
          <span className="wa-sheen" />
          <svg className="wa-glyph" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.49-8.42"
            />
          </svg>
        </span>
        <span className="wa-badge" aria-hidden="true">1</span>
      </a>

      <style>{`
        /* ── dock ─────────────────────────────────────────────
           Fixed bottom-right stack: invite card on top, FAB below.
           The dock itself owns the entrance spring so hover transforms on
           the button never fight the intro. */
        .wa-dock {
          position: fixed;
          right: 24px;
          bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          /* below the mobile menu drawer (1000/1001) and every modal, above content */
          z-index: 900;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(28px) scale(0.7);
          transition: opacity 480ms ease, transform 620ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .wa-dock.is-shown { opacity: 1; transform: none; }
        .wa-dock > * { pointer-events: auto; }

        /* ── invite card ── */
        .wa-card {
          position: relative;
          width: 268px;
          max-width: calc(100vw - 48px);
          border-radius: 20px;
          background: #fff;
          border: 1px solid rgba(12, 16, 20, 0.08);
          box-shadow: 0 18px 44px -14px rgba(8, 20, 14, 0.32), 0 2px 8px rgba(8, 20, 14, 0.06);
          opacity: 0;
          visibility: hidden;
          transform: translateY(14px) scale(0.94);
          transform-origin: 88% 100%;
          transition: opacity 260ms ease, transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1), visibility 0s linear 420ms;
        }
        .wa-card.is-open {
          opacity: 1;
          visibility: visible;
          transform: none;
          transition: opacity 320ms ease, transform 520ms cubic-bezier(0.34, 1.4, 0.64, 1), visibility 0s;
        }
        .wa-card::after {
          content: "";
          position: absolute;
          right: 26px;
          bottom: -7px;
          width: 14px;
          height: 14px;
          background: #fff;
          border-right: 1px solid rgba(12, 16, 20, 0.08);
          border-bottom: 1px solid rgba(12, 16, 20, 0.08);
          transform: rotate(45deg);
          border-bottom-right-radius: 3px;
        }
        .wa-card-x {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          padding: 0;
          border-radius: 50%;
          background: rgba(12, 16, 20, 0.05);
          color: rgba(12, 16, 20, 0.45);
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .wa-card-x:hover { background: rgba(12, 16, 20, 0.1); color: rgba(12, 16, 20, 0.8); }
        .wa-card-body { display: block; padding: 16px 16px 15px; }
        .wa-card-head { display: flex; align-items: center; gap: 10px; }
        .wa-card-avatar {
          width: 34px;
          height: 34px;
          flex: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #2ee06a, #0f9d58);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .wa-card-who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .wa-card-who strong { font-size: 13.5px; font-weight: 600; color: #0c1014; letter-spacing: -0.01em; }
        .wa-card-who em {
          display: flex;
          align-items: center;
          gap: 5px;
          font-style: normal;
          font-size: 11px;
          color: rgba(12, 16, 20, 0.5);
        }
        .wa-live {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #25d366;
          box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
          animation: wa-live 2s ease-out infinite;
        }
        @keyframes wa-live {
          0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .wa-card-text {
          display: block;
          margin-top: 11px;
          font-size: 12.5px;
          line-height: 1.5;
          color: rgba(12, 16, 20, 0.66);
        }
        .wa-card-cta {
          display: block;
          margin-top: 13px;
          height: 36px;
          line-height: 36px;
          text-align: center;
          border-radius: 999px;
          background: linear-gradient(145deg, #2ee06a, #12a850);
          color: #fff;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: filter 160ms ease, transform 160ms ease;
        }
        .wa-card-body:hover .wa-card-cta { filter: brightness(1.06); transform: translateY(-1px); }

        /* ── floating action button ── */
        .wa-fab {
          position: relative;
          display: flex;
          align-items: center;
          height: 62px;
          border-radius: 999px;
          background: linear-gradient(145deg, #4ceb7d 0%, #25d366 46%, #0d9f4f 100%);
          box-shadow:
            0 14px 30px -10px rgba(18, 168, 80, 0.62),
            0 4px 12px rgba(8, 20, 14, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.32);
          color: #fff;
          isolation: isolate;
          transition: transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 320ms ease;
        }
        .wa-fab:active { transform: scale(0.95); }

        /* pulsing halos — the eye-catcher, paused on hover so the pill reads cleanly */
        .wa-halo {
          position: absolute;
          right: 0;
          top: 0;
          /* декоративное кольцо: не ловит тапы и не вылезает за край экрана */
          pointer-events: none;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          border: 2px solid rgba(37, 211, 102, 0.55);
          z-index: -1;
          opacity: 0;
          animation: wa-halo 2900ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
        }
        .wa-halo--b { animation-delay: 1450ms; }
        @keyframes wa-halo {
          0%   { transform: scale(1); opacity: 0.75; }
          70%  { opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }

        .wa-core {
          position: relative;
          width: 62px;
          height: 62px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          overflow: hidden;
          /* idle attention beat: a short double-wiggle every 6s */
          animation: wa-beat 6s ease-in-out infinite;
        }
        @keyframes wa-beat {
          0%, 80%, 100% { transform: rotate(0deg) scale(1); }
          84%  { transform: rotate(-9deg) scale(1.07); }
          88%  { transform: rotate(7deg)  scale(1.07); }
          92%  { transform: rotate(-5deg) scale(1.03); }
          96%  { transform: rotate(0deg)  scale(1); }
        }
        .wa-glyph { position: relative; z-index: 1; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18)); }

        /* glass sheen sweeping across the disc */
        .wa-sheen {
          position: absolute;
          inset: -40%;
          background: linear-gradient(72deg, transparent 38%, rgba(255, 255, 255, 0.55) 50%, transparent 62%);
          transform: translateX(-120%);
          animation: wa-sheen 5.6s ease-in-out infinite;
        }
        @keyframes wa-sheen {
          0%, 62%   { transform: translateX(-120%); }
          80%, 100% { transform: translateX(120%); }
        }

        /* label: the pill grows leftwards out of the circle on hover */
        .wa-label {
          max-width: 0;
          overflow: hidden;
          white-space: nowrap;
          opacity: 0;
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          padding-left: 0;
          transition:
            max-width 460ms cubic-bezier(0.22, 1, 0.36, 1),
            padding-left 460ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 240ms ease 90ms;
        }

        .wa-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          border-radius: 999px;
          background: #ff5a48;
          border: 2px solid #fff;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          line-height: 17px;
          text-align: center;
          box-shadow: 0 3px 8px rgba(255, 90, 72, 0.45);
          animation: wa-badge-in 620ms cubic-bezier(0.34, 1.56, 0.64, 1) 2.4s both;
        }
        @keyframes wa-badge-in {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        @media (hover: hover) {
          .wa-fab:hover {
            transform: translateY(-3px);
            box-shadow:
              0 22px 44px -12px rgba(18, 168, 80, 0.75),
              0 6px 16px rgba(8, 20, 14, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
          }
          .wa-fab:hover .wa-label { max-width: 230px; opacity: 1; padding-left: 24px; }
          .wa-fab:hover .wa-halo { animation-play-state: paused; opacity: 0; }
          .wa-fab:hover .wa-core { animation: none; }
          .wa-fab:hover .wa-glyph { animation: wa-nudge 700ms ease; }
        }
        @keyframes wa-nudge {
          0%   { transform: scale(1) rotate(0deg); }
          40%  { transform: scale(1.16) rotate(-10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .wa-fab:focus-visible {
          outline: 3px solid rgba(37, 211, 102, 0.45);
          outline-offset: 4px;
        }

        @media (max-width: 639px) {
          .wa-dock {
            right: 16px;
            bottom: calc(18px + env(safe-area-inset-bottom, 0px));
            gap: 12px;
          }
          .wa-fab { height: 56px; }
          .wa-core, .wa-halo { width: 56px; height: 56px; }
          .wa-glyph { width: 27px; height: 27px; }
          .wa-card { width: 244px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-dock { transition: opacity 200ms linear; transform: none; }
          .wa-halo, .wa-sheen, .wa-live { animation: none; opacity: 0; }
          .wa-core, .wa-badge { animation: none; }
          .wa-card { transition: opacity 200ms linear; transform: none; }
        }
      `}</style>
    </div>
  );
}
