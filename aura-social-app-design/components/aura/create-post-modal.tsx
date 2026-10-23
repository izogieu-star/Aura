'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ImagePlus, MapPin, RefreshCw, Sparkles, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { HK_LOCATIONS } from '@/lib/aura-data'
import { cn } from '@/lib/utils'

const MAX_CAPTION = 150

export type NewPost = { media: string; mediaType: 'image' | 'video'; caption: string; location: string }

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (post: NewPost) => void
}

export function CreatePostModal({ open, onClose, onSubmit }: Props) {
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState(HK_LOCATIONS[0])
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const captionId = useId()
  const locationId = useId()

  function pickFile(file?: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return
    if (media) URL.revokeObjectURL(media.url)
    setMedia({ url: URL.createObjectURL(file), type: file.type.startsWith('video/') ? 'video' : 'image' })
  }

  function reset() {
    setMedia(null)
    setCaption('')
    setLocation(HK_LOCATIONS[0])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!media) return
    onSubmit({ media: media.url, mediaType: media.type, caption: caption.trim(), location })
    reset()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col bg-background"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-title"
        >
          <header className="flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
            <h2 id="create-title" className="text-base font-bold">
              New Aura Post
            </h2>
            <span className="w-10" />
          </header>

          <form onSubmit={handleSubmit} className="no-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickFile(e.dataTransfer.files?.[0])
              }}
              className={cn(
                'relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed transition-colors',
                dragging ? 'border-aura-accent bg-aura-accent/10' : 'border-white/15 bg-card',
                media && 'border-solid border-transparent',
              )}
            >
              {media ? (
                <>
                  {media.type === 'video' ? (
                    <video src={media.url} className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.url || '/placeholder.svg'} alt="Selected upload preview" className="absolute inset-0 size-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="glass absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Replace
                  </button>
                </>
              ) : (
                <>
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-aura-accent/15 text-aura-accent">
                    <ImagePlus className="size-8" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Drag & drop a photo or video</p>
                    <p className="mt-1 text-sm text-muted-foreground">Vertical 9:16 looks best</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
                    >
                      Browse
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
                    >
                      <Camera className="size-4" aria-hidden="true" />
                      Snap
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={captionId} className="text-sm font-semibold">
                  Caption
                </label>
                <span
                  className={cn(
                    'font-mono text-xs',
                    caption.length >= MAX_CAPTION ? 'text-aura-neg' : 'text-muted-foreground',
                  )}
                >
                  {caption.length}/{MAX_CAPTION}
                </span>
              </div>
              <textarea
                id={captionId}
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                maxLength={MAX_CAPTION}
                rows={3}
                placeholder="What's the vibe?"
                className="w-full resize-none rounded-2xl bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-aura-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={locationId} className="flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="size-4 text-aura-accent" aria-hidden="true" />
                Location
              </label>
              <div className="relative">
                <select
                  id={locationId}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl bg-card px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-aura-accent"
                >
                  {HK_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}, Hong Kong
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  HK
                </span>
              </div>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
                {HK_LOCATIONS.slice(0, 5).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocation(l)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      location === l
                        ? 'border-aura-accent bg-aura-accent/15 text-foreground'
                        : 'border-white/10 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <p className="rounded-2xl bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              Your Aura score stays locked for 24 hours. Votes are hidden until the reveal.
            </p>

            <motion.button
              type="submit"
              disabled={!media}
              whileTap={media ? { scale: 0.96 } : undefined}
              className="mt-auto flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-aura-pos via-aura-accent to-aura-neg text-base font-black text-white shadow-[0_0_40px_-10px_var(--aura-accent)] transition-opacity disabled:opacity-40"
            >
              <Sparkles className="size-5" aria-hidden="true" />
              Drop Aura Post
            </motion.button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
