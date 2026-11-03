// Shows each frame finish once (about a second each), then returns to the first, so visitors see that the
// switcher works. Under 5 seconds in total, stops at the first touch, click or key, and never runs for
// people who ask for reduced motion.
const STEP_MS = 1100

export function cycleFinishes(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
  if (inputs.length < 2) return

  let stopped = false
  const stop = () => (stopped = true)
  for (const type of ['pointerdown', 'keydown', 'focusin']) root.addEventListener(type, stop, { once: true })

  // Only the main pictures: close-ups further down may not load until scrolled to.
  const ready = Promise.all([...root.querySelectorAll<HTMLImageElement>('img.shot')].map((img) => img.decode().catch(() => {})))
  const timeout = new Promise((_, reject) => setTimeout(reject, 5000))

  const run = async () => {
    try {
      await Promise.race([ready, timeout])
    } catch {
      return // pictures too slow: skip the demo rather than flash empty frames
    }
    const order = [...inputs.slice(1), inputs[0]]
    for (const input of order) {
      await new Promise((r) => setTimeout(r, STEP_MS))
      if (stopped) return
      input.checked = true
    }
  }

  const seen = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return
      seen.disconnect()
      setTimeout(run, 600)
    },
    { threshold: 0.6 },
  )
  seen.observe(root)
}

document.querySelectorAll<HTMLElement>('[data-finish-cycle]').forEach(cycleFinishes)
