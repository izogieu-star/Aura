export type Vote = 'up' | 'down'

export type Creator = {
  username: string
  name: string
  avatar: string
}

export type Comment = {
  id: string
  username: string
  avatar: string
  text: string
  ago: string
}

export type Post = {
  id: string
  creator: Creator
  media: string
  mediaType: 'image' | 'video'
  caption: string
  location: string
  /** ms after app load when the score reveals; <= 0 means already revealed */
  unlockOffsetMs: number
  netAura: number
  comments: Comment[]
}

const HOUR = 3_600_000
const MIN = 60_000

export const ME: Creator = {
  username: 'kaito.hk',
  name: 'Kaito Wong',
  avatar: '/avatars/me.png',
}

const creators: Creator[] = [
  { username: 'mina.neon', name: 'Mina Lau', avatar: '/avatars/a1.png' },
  { username: 'jaycurls', name: 'Jay Cheng', avatar: '/avatars/a2.png' },
  { username: 'vee.shades', name: 'Vivian Ho', avatar: '/avatars/a3.png' },
  { username: 'b.nightshift', name: 'Ben Tsang', avatar: '/avatars/a4.png' },
  { username: 'ari.braids', name: 'Ari Mok', avatar: '/avatars/a5.png' },
]

const sampleComments: Comment[] = [
  { id: 'c1', username: 'jaycurls', avatar: '/avatars/a2.png', text: 'this is giving main character', ago: '2h' },
  { id: 'c2', username: 'vee.shades', avatar: '/avatars/a3.png', text: 'LKF never misses', ago: '3h' },
  { id: 'c3', username: 'ari.braids', avatar: '/avatars/a5.png', text: 'locking in my +aura rn', ago: '5h' },
]

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    creator: creators[0],
    media: '/posts/lkf-night.png',
    mediaType: 'image',
    caption: 'Friday fits in LKF. Rate the vibe, no mercy.',
    location: 'Lan Kwai Fong',
    unlockOffsetMs: 14 * HOUR + 32 * MIN,
    netAura: 4200,
    comments: sampleComments,
  },
  {
    id: 'p2',
    creator: creators[1],
    media: '/posts/mongkok-food.png',
    mediaType: 'image',
    caption: 'Best egg waffle in Mong Kok? Fight me.',
    location: 'Mong Kok',
    unlockOffsetMs: 12_000,
    netAura: 3175,
    comments: sampleComments.slice(0, 2),
  },
  {
    id: 'p3',
    creator: creators[2],
    media: '/posts/peak-sunset.png',
    mediaType: 'image',
    caption: 'Blue hour from The Peak. Worth the hike.',
    location: 'Victoria Peak',
    unlockOffsetMs: 0,
    netAura: 8930,
    comments: sampleComments,
  },
  {
    id: 'p4',
    creator: creators[3],
    media: '/posts/skate-central.png',
    mediaType: 'image',
    caption: 'Kickflip under the Central walkway. Security was not impressed.',
    location: 'Central',
    unlockOffsetMs: 6 * HOUR + 5 * MIN,
    netAura: -640,
    comments: sampleComments.slice(1),
  },
  {
    id: 'p5',
    creator: creators[4],
    media: '/posts/fit-check.png',
    mediaType: 'image',
    caption: 'Fit check before the rooftop. Honest aura only.',
    location: 'Sheung Wan',
    unlockOffsetMs: 0,
    netAura: -1210,
    comments: sampleComments.slice(0, 1),
  },
  {
    id: 'p6',
    creator: creators[0],
    media: '/posts/star-ferry.png',
    mediaType: 'image',
    caption: 'Star Ferry golden hour with the crew.',
    location: 'Tsim Sha Tsui',
    unlockOffsetMs: 21 * HOUR + 48 * MIN,
    netAura: 2540,
    comments: [],
  },
]

export type ProfilePost = {
  id: string
  media: string
  unlockOffsetMs: number
  netAura: number
}

export const MY_POSTS: ProfilePost[] = [
  { id: 'm1', media: '/posts/star-ferry.png', unlockOffsetMs: 9 * HOUR, netAura: 0 },
  { id: 'm2', media: '/posts/peak-sunset.png', unlockOffsetMs: 0, netAura: 3820 },
  { id: 'm3', media: '/posts/lkf-night.png', unlockOffsetMs: 0, netAura: 2210 },
  { id: 'm4', media: '/posts/skate-central.png', unlockOffsetMs: 0, netAura: -420 },
  { id: 'm5', media: '/posts/mongkok-food.png', unlockOffsetMs: 0, netAura: 1960 },
  { id: 'm6', media: '/posts/fit-check.png', unlockOffsetMs: 0, netAura: 2740 },
  { id: 'm7', media: '/posts/star-ferry.png', unlockOffsetMs: 0, netAura: 1180 },
  { id: 'm8', media: '/posts/peak-sunset.png', unlockOffsetMs: 0, netAura: -310 },
  { id: 'm9', media: '/posts/lkf-night.png', unlockOffsetMs: 0, netAura: 1270 },
]

export const HK_LOCATIONS = [
  'Lan Kwai Fong',
  'Mong Kok',
  'Central',
  'Tsim Sha Tsui',
  'Causeway Bay',
  'Sheung Wan',
  'Victoria Peak',
  'Sai Kung',
]

export type Scope = 'friends' | 'hk' | 'global'
export type Timeframe = 'week' | 'month' | 'all'

export type Ranked = {
  rank: number
  username: string
  avatar?: string
  netAura: number
}

const handles = [
  'mina.neon', 'jaycurls', 'vee.shades', 'b.nightshift', 'ari.braids', 'kaito.hk', 'lofi.lok', 'tsz.ching',
  'hiro.wav', 'dimsum.dan', 'cyan.chan', 'pearl.river', 'neon.ngai', 'mk.matt', 'sai.kung.sun', 'yuki.flux',
  'ziggy.tst', 'harbour.hana', 'ocean.oli', 'cwb.cass', 'rooftop.ray', 'kowloon.kai', 'bao.bella', 'tram.tom',
  'skyline.sky', 'jade.jo', 'mango.mei', 'kitty.kwan', 'echo.eason', 'lantern.lu',
]

const avatarMap: Record<string, string> = {
  'mina.neon': '/avatars/a1.png',
  jaycurls: '/avatars/a2.png',
  'vee.shades': '/avatars/a3.png',
  'b.nightshift': '/avatars/a4.png',
  'ari.braids': '/avatars/a5.png',
  'kaito.hk': '/avatars/me.png',
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function getLeaderboard(scope: Scope, timeframe: Timeframe): Ranked[] {
  const scopeSeed = { friends: 7, hk: 19, global: 41 }[scope]
  const timeSeed = { week: 3, month: 11, all: 29 }[timeframe]
  const rand = seeded(scopeSeed * 100 + timeSeed)
  const count = scope === 'friends' ? 24 : 100
  const multiplier = { week: 1, month: 3.4, all: 11 }[timeframe] * (scope === 'global' ? 4 : 1)
  const top = Math.round((9000 + rand() * 6000) * multiplier)

  const pool = [...handles]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const negativeFrom = Math.floor(count * 0.86)
  let score = top
  return Array.from({ length: count }, (_, i) => {
    const base = pool[i % pool.length]
    const username = i < pool.length ? base : `${base}${Math.floor(i / pool.length)}${Math.floor(rand() * 9)}`
    if (i > 0) {
      const drop = i >= negativeFrom ? 0.08 : 0.035
      score = Math.round(score - (top * drop * (0.4 + rand())) / (i < 10 ? 1 : 2.4))
    }
    return { rank: i + 1, username, avatar: avatarMap[username], netAura: score }
  })
}

export function formatAura(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}${Math.abs(n).toLocaleString('en-US')}`
}

export function formatCompact(n: number) {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}
