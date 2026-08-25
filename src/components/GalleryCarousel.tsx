import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { ShowcaseCard } from '../types';
import CardFrontFace from './CardFrontFace';

interface GalleryCarouselProps {
  cards: ShowcaseCard[];
  onSelectCentered: (card: ShowcaseCard) => void;
}

// Timing for the "reveal the back" sequence that plays whenever a card with a back image
// becomes centered: settle (let the scale-up finish) -> flip to back -> hold -> flip back
// to front -> advance. Flip duration here must match the transition-duration on the flip
// div below (duration-[1050ms]).
const FLIP_SETTLE_MS = 500;
const FLIP_DURATION_MS = 1050;
const FLIP_HOLD_MS = 1800;

// How long to wait after a card settles (no back to show) before drifting to the next one.
// Small and non-zero: a real gap is needed for browsers to paint the settled frame before
// starting the next transition, but kept low enough to read as continuous motion rather
// than a stop-and-go stepping.
const ADVANCE_GAP_MS = 50;

// Hoisted to module scope so these keep a stable identity across renders. swiper/react
// reinitializes the underlying Swiper instance when these prop identities change; as inline
// literals they'd be recreated (and the carousel reset to slide 0) on every render — which
// is exactly what our own setFlippedCardId calls would otherwise trigger, in a feedback loop.
const SWIPER_MODULES = [EffectCoverflow, Keyboard];
const KEYBOARD_CONFIG = { enabled: true };
const COVERFLOW_EFFECT_CONFIG = { rotate: 35, stretch: 0, depth: 200, modifier: 1, slideShadows: false };

// Visitor-facing Hall of Fame view: a 3D coverflow floating over a stadium-lights
// background. Admins still get the plain grid in Gallery.tsx — this is visitor-only.
const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ cards, onSelectCentered }) => {
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pausedRef = useRef(false);
  const swiperRef = useRef<SwiperType | null>(null);

  // Swiper's loop mode needs enough real slides to duplicate cleanly with slidesPerView="auto"
  const loop = cards.length >= 5;

  const clearFlipTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);
  useEffect(() => clearFlipTimers, [clearFlipTimers]);

  // We drive advancement ourselves (rather than Swiper's Autoplay module) so there is no
  // separate internal clock that can race our flip-sequence pause: Autoplay's own "next
  // transition" timer can fire even after calling autoplay.stop() when its delay is near
  // zero, landing the flip on the card that *was* centered rather than the one that is —
  // calling slideNext()/slideToLoop() ourselves, only when we decide to, avoids that.
  const scheduleAdvance = useCallback((swiper: SwiperType) => {
    if (pausedRef.current || swiper.destroyed) return;
    timersRef.current.push(setTimeout(() => {
      if (pausedRef.current || swiper.destroyed) return;
      swiper.slideNext();
    }, ADVANCE_GAP_MS));
  }, []);

  // Fires whenever a new card lands centered — via our own scheduled advance, a manual
  // swipe, or a manual click alike. If it has a back image, run the flip-to-back-and-back
  // sequence before continuing; otherwise just continue.
  //
  // Memoized with useCallback: swiper/react subscribes this as a real event listener on
  // the underlying Swiper instance, keyed off this prop's identity. Left as a plain inline
  // function, a new one is created every render — and since this handler itself calls
  // setState (which re-renders), that becomes a feedback loop of ever-accumulating
  // duplicate listeners, each restarting the sequence from scratch on every fire.
  const handleCentered = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    clearFlipTimers();
    setFlippedCardId(null);
    const card = cards[swiper.realIndex];
    if (!card?.backImageUrl) {
      scheduleAdvance(swiper);
      return;
    }

    timersRef.current.push(setTimeout(() => {
      setFlippedCardId(card.id);
      timersRef.current.push(setTimeout(() => {
        setFlippedCardId(null);
        timersRef.current.push(setTimeout(() => {
          scheduleAdvance(swiper);
        }, FLIP_DURATION_MS));
      }, FLIP_DURATION_MS + FLIP_HOLD_MS));
    }, FLIP_SETTLE_MS));
  }, [cards, clearFlipTimers, scheduleAdvance]);

  // Swiper's own click-to-slide detection (clickedIndex / slideToClickedSlide) relies on
  // elementFromPoint()/closest() picking the clicked .swiper-slide. Some browser engines
  // don't correctly hit-test elements rotated in 3D (rotateY, as coverflow's side cards
  // are) and resolve the click back to the unrotated wrapper instead — even though the
  // card is what's visibly painted there. So we find the intended slide ourselves from
  // click geometry (bounding-box centers), which stays reliable regardless of that gap.
  const handleSwiperClick = useCallback((swiper: SwiperType, event: MouseEvent | TouchEvent | PointerEvent) => {
    const clientX = 'clientX' in event ? event.clientX : event.changedTouches?.[0]?.clientX;
    if (clientX === undefined) return;

    let nearestEl: HTMLElement | undefined;
    let nearestDomIndex = -1;
    let nearestDist = Infinity;
    for (let domIndex = 0; domIndex < swiper.slides.length; domIndex += 1) {
      const el = swiper.slides[domIndex];
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) continue;
      const dist = Math.abs(clientX - (rect.left + rect.width / 2));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEl = el;
        nearestDomIndex = domIndex;
      }
    }
    if (!nearestEl) return;

    if (nearestDomIndex === swiper.activeIndex) {
      const card = cards[swiper.realIndex];
      if (card) onSelectCentered(card);
    } else if (loop) {
      const realIndex = parseInt(nearestEl.getAttribute('data-swiper-slide-index') || '', 10);
      if (!Number.isNaN(realIndex)) swiper.slideToLoop(realIndex);
    } else {
      swiper.slideTo(nearestDomIndex);
    }
  }, [cards, loop, onSelectCentered]);

  // Pause/resume our own advance loop on hover — same intent as Autoplay's
  // pauseOnMouseEnter, just driven by us since we're not using that module.
  const handleMouseEnter = useCallback(() => { pausedRef.current = true; }, []);
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    // If we skipped scheduling an advance while paused, wake the loop back up (harmless
    // no-op if a flip sequence is still in progress and will schedule its own on completion).
    if (swiperRef.current && flippedCardId === null) scheduleAdvance(swiperRef.current);
  }, [flippedCardId, scheduleAdvance]);

  if (cards.length === 0) return null;

  return (
    // Full-bleed breakout: the page wraps everything in a max-w-7xl container, but the
    // stadium should feel edge-to-edge regardless of that width.
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
      <div
        className="stadium-section py-10 sm:py-12 md:py-14 lg:py-16"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="stadium-haze"></div>
        <div className="stadium-sweep"></div>
        <div className="stadium-sweep stadium-sweep-2"></div>
        <div className="stadium-crowd"></div>

        <Swiper
          modules={SWIPER_MODULES}
          effect="coverflow"
          centeredSlides
          slidesPerView="auto"
          loop={loop}
          rewind={!loop}
          speed={2800}
          grabCursor
          keyboard={KEYBOARD_CONFIG}
          coverflowEffect={COVERFLOW_EFFECT_CONFIG}
          onClick={handleSwiperClick}
          onSwiper={handleCentered}
          onSlideChangeTransitionEnd={handleCentered}
          // Extra vertical padding here (not just on .stadium-section below) so the active
          // card's CSS scale-up has room to grow into: Swiper's own root element clips to
          // the *unscaled* slide height regardless of how big .stadium-section itself is,
          // since transform:scale() never changes layout size, only paint.
          className="relative z-10 !py-6 sm:!py-8 md:!py-10 lg:!py-[5vh] xl:!py-[6vh]"
        >
          {cards.map((card) => {
            const isFlipped = flippedCardId === card.id;
            return (
              <SwiperSlide key={card.id} className="!w-auto !h-56 sm:!h-64 md:!h-96 lg:!h-[52vh] xl:!h-[58vh] aspect-[2.5/3.5]">
                {/* coverflow-card grows via CSS when Swiper marks this slide swiper-slide-active
                    (see index.html) — the scale lives on this element because Swiper drives the
                    slide's own transform directly and would clobber one set here via a class. */}
                <div className="coverflow-card group relative w-full h-full cursor-pointer perspective-1000">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${card.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-[1050ms] -z-10 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}></div>
                  <div
                    className={`relative w-full h-full transition-transform duration-[1050ms] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                  >
                    {/* front */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800">
                      <CardFrontFace card={card} />
                    </div>
                    {/* back — only present (and thus only ever shown) when the card has one */}
                    {card.backImageUrl && (
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800">
                        <img
                          src={card.backImageUrl}
                          alt={`${card.player} card back`}
                          className="w-full h-full object-fill"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default GalleryCarousel;
