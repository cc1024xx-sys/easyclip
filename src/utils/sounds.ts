let audioCtx: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export async function resumeAudio(): Promise<void> {
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  startTime?: number,
) {
  const ctx = getContext()
  const t = startTime ?? ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, t)

  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration)
}

function playNoise(duration: number, volume = 0.06, freq = 1200) {
  const ctx = getContext()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  filter.type = 'bandpass'
  filter.frequency.value = freq
  filter.Q.value = 0.8

  source.buffer = buffer
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()
}

/** Metal clip snap with spring bounce */
export function playClipSnap() {
  resumeAudio()
  const ctx = getContext()
  const t = ctx.currentTime

  playTone(1800, 0.04, 'square', 0.06, t)
  playTone(900, 0.06, 'triangle', 0.08, t + 0.03)
  playNoise(0.08, 0.04, 2000)

  setTimeout(() => {
    playTone(600, 0.05, 'triangle', 0.05)
    playNoise(0.06, 0.03, 800)
  }, 60)

  setTimeout(() => {
    playTone(400, 0.04, 'sine', 0.03)
  }, 120)
}

/** Paper sliding under clip */
export function playPaperSlide() {
  resumeAudio()
  playNoise(0.15, 0.05, 600)
  setTimeout(() => playNoise(0.1, 0.03, 400), 80)
}

export function playPaperCrumple() {
  resumeAudio()
  playNoise(0.3, 0.08, 900)
  setTimeout(() => playNoise(0.2, 0.05, 700), 100)
  setTimeout(() => playNoise(0.12, 0.03, 500), 200)
}

export function playCanvasDrop() {
  resumeAudio()
  playNoise(0.1, 0.04, 300)
  setTimeout(() => playTone(200, 0.15, 'sine', 0.04), 50)
}

export function playSealSound() {
  resumeAudio()
  playClipSnap()
  setTimeout(() => playPaperSlide(), 150)
  setTimeout(() => playTone(350, 0.3, 'sine', 0.05), 300)
}
