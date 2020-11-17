import LRU from 'lru-cache'

const options = {
  max: 500,
  maxAge: 1000 * 60 * 60 * 24
}

export const cache = new LRU(options)
