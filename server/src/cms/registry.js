import { buildModel } from './modelFactory.js'
import { publicSchema } from './defineType.js'
import { ApiError } from '../utils/ApiError.js'

import settings from './types/settings.js'
import navigation from './types/navigation.js'
import sections from './types/sections.js'
import pages from './types/pages.js'
import hero from './types/hero.js'
import philosophy from './types/philosophy.js'
import journey from './types/journey.js'
import research from './types/research.js'
import credentials from './types/credentials.js'
import reels from './types/reels.js'
import photos from './types/photos.js'
import testimonials from './types/testimonials.js'
import treatments from './types/treatments.js'
import conditions from './types/conditions.js'
import faqs from './types/faqs.js'
import posts from './types/posts.js'
import locations from './types/locations.js'

/**
 * Every content type in the CMS. Order here is the order of the admin sidebar
 * within each group.
 */
const definitions = [
  // Site
  settings, navigation, sections, pages,
  // Home page
  hero, philosophy, journey, research, credentials, reels, photos, testimonials,
  // Clinical
  treatments, conditions, faqs,
  // Editorial
  posts,
  // Practice
  locations,
]

const registry = new Map()

for (const def of definitions) {
  if (registry.has(def.name)) throw new Error(`Duplicate content type: ${def.name}`)
  registry.set(def.name, { ...def, model: buildModel(def) })
}

export const GROUP_ORDER = ['Site', 'Home Page', 'Clinical', 'Editorial', 'Practice']

export function allTypes() {
  return [...registry.values()]
}

export function getType(name) {
  const type = registry.get(name)
  if (!type) throw ApiError.notFound(`Unknown content type "${name}"`)
  return type
}

export function hasType(name) {
  return registry.has(name)
}

/** The schema payload the admin UI boots from. */
export function schemaManifest() {
  const groups = new Map()
  for (const type of allTypes()) {
    if (!groups.has(type.group)) groups.set(type.group, [])
    groups.get(type.group).push(publicSchema(type))
  }
  return {
    groups: [...groups.entries()]
      .sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a[0])
        const bi = GROUP_ORDER.indexOf(b[0])
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
      .map(([name, types]) => ({ name, types })),
    types: allTypes().map(publicSchema),
  }
}
