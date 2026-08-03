/**
 * The animation layer.
 *
 * Framer Motion ships a React-free entry point (`framer-motion/dom`) whose
 * imperative `animate()` drives plain DOM nodes, so the CMS gets the same
 * spring physics as the public React site without pulling React into this
 * bundle.
 *
 * Everything funnels through here so there is one place that honours
 * "reduce motion" and one set of timings, rather than durations drifting
 * apart across a dozen views.
 */

import { animate, stagger } from 'framer-motion/dom'

// ─── Tokens ──────────────────────────────────────────────────────────────────

/** Standard ease-out. Fast start, soft landing — reads as responsive. */
export const EASE = [0.22, 0.61, 0.36, 1]

/** Weighty enough to feel physical, damped enough never to visibly wobble. */
export const SPRING = { type: 'spring', stiffness: 420, damping: 40, mass: 0.9 }
export const SPRING_POP = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 }

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export const motionOff = () => reduceMotion.matches

const settled = () => Promise.resolve()

function list(nodes) {
  if (!nodes) return []
  if (nodes instanceof Node) return [nodes]
  return [...nodes].filter(Boolean)
}

/**
 * Drops straight to the final frame. Transforms are cleared rather than
 * resolved because `x`/`y`/`scale` are Motion's own value names, not CSS
 * properties — only the opacity endpoint is meaningful without animation.
 */
function land(nodes, keyframes) {
  for (const node of nodes) {
    if ('opacity' in keyframes) {
      const value = keyframes.opacity
      node.style.opacity = String(Array.isArray(value) ? value.at(-1) : value)
    }
    node.style.transform = ''
  }
}

/** `animate()`, but a no-op that still lands correctly when motion is reduced. */
export function play(nodes, keyframes, options = {}) {
  const targets = list(nodes)
  if (!targets.length) return settled()
  if (motionOff()) {
    land(targets, keyframes)
    return settled()
  }
  return animate(targets, keyframes, options).finished.catch(() => {})
}

// ─── Presets ─────────────────────────────────────────────────────────────────

/** Content arriving: a short rise into place. */
export function enter(node, { y = 8, duration = 0.34, delay = 0 } = {}) {
  return play(node, { opacity: [0, 1], y: [y, 0] }, { duration, delay, ease: EASE })
}

/** Content leaving. Faster than the entrance — exits should not be dwelt on. */
export function leave(node, { y = -6, duration = 0.16 } = {}) {
  return play(node, { opacity: [1, 0], y: [0, y] }, { duration, ease: 'easeIn' })
}

/**
 * A list settling in. The per-item delay is capped because a 50-row table that
 * takes two seconds to finish arriving is an animation the user waits on
 * rather than one that helps them read.
 */
export function stack(nodes, { y = 10, each = 0.028, cap = 0.32 } = {}) {
  const targets = list(nodes)
  if (!targets.length) return settled()

  const step = Math.min(each, cap / targets.length)
  return play(targets, { opacity: [0, 1], y: [y, 0] },
    { duration: 0.3, delay: stagger(step), ease: EASE })
}

/** Dialogs: a small scale-up, so they read as arriving rather than blinking in. */
export function popIn(node) {
  return play(node, { opacity: [0, 1], scale: [0.96, 1] }, SPRING_POP)
}

export function popOut(node) {
  return play(node, { opacity: [1, 0], scale: [1, 0.97] }, { duration: 0.13, ease: 'easeIn' })
}

export function fade(node, [from, to], duration = 0.2) {
  return play(node, { opacity: [from, to] }, { duration, ease: EASE })
}

/** The mobile navigation drawer. Spring, so even a fast open lands softly. */
export function slideDrawer(node, open) {
  return play(node, { x: open ? ['-100%', '0%'] : ['0%', '-100%'] }, SPRING)
}

/**
 * Tactile feedback on tap, delegated from the shell so controls rendered
 * later get it for free. Motion's own `press()` binds to the elements it
 * resolves up front, which a re-rendering view would leave behind.
 */
export function pressFeedback(root) {
  if (motionOff()) return

  root.addEventListener('pointerdown', event => {
    const target = event.target.closest('.btn, .tab, .media-tile')
    if (!target || target.disabled) return

    animate(target, { scale: 0.97 }, { duration: 0.08, ease: 'easeOut' })

    const release = () => {
      animate(target, { scale: 1 }, SPRING_POP)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
  })
}
