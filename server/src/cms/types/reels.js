import { defineType } from '../defineType.js'

export default defineType({
  name: 'reels',
  label: 'Video Reels',
  singular: 'Reel',
  group: 'Home Page',
  icon: '🎬',
  description: 'Short explainer videos in the "Explained in minutes" rail.',
  listColumns: ['title', 'platform', 'status', 'order'],
  searchFields: ['title', 'desc'],
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, listColumn: true },
    { name: 'desc', type: 'string', label: 'Description', required: true },
    {
      name: 'platform',
      type: 'select',
      label: 'Platform',
      required: true,
      listColumn: true,
      default: 'youtube',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'instagram', label: 'Instagram' },
      ],
    },
    { name: 'url', type: 'url', label: 'Video URL', help: 'Where the card links to.' },
    { name: 'thumbnail', type: 'image', label: 'Thumbnail' },
    {
      name: 'gradient',
      type: 'string',
      label: 'Fallback gradient',
      help: 'CSS gradient used when no thumbnail is set.',
      default: 'linear-gradient(160deg,#1a0a0e,#3d1020,#6b1f36)',
    },
    { name: 'duration', type: 'string', label: 'Duration', help: 'e.g. "2:14".' },
    { name: 'views', type: 'string', label: 'View count', help: 'Display text, e.g. "12K".' },
    {
      name: 'sourceId',
      type: 'string',
      label: 'Source video ID',
      help: 'Set automatically when this reel was pulled in by the YouTube sync — used to match it on future syncs and update its view count. Leave blank for reels you add by hand.',
    },
  ],
})
