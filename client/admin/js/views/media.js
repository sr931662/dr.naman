import { api } from '../api.js'
import { el, clear, toast, confirmDialog, modal, bytes, formatDate, debounce } from '../ui.js'
import { page, pageHeader, can } from '../app.js'

export async function renderMedia() {
  const { node, reload } = mediaBrowser({ selectable: false })
  await reload()

  return page(
    pageHeader({
      title: 'Media Library',
      description: 'Images and documents used across the site.',
    }),
    node,
  )
}

/**
 * Opens the library as a picker and resolves with the chosen asset
 * (or null if the editor cancels).
 */
export function pickMedia() {
  return new Promise(resolve => {
    let settled = false
    const finish = value => {
      if (settled) return
      settled = true
      dialog.close()
      resolve(value)
    }

    const { node, reload } = mediaBrowser({ selectable: true, onSelect: finish })

    const dialog = modal({
      title: 'Choose an image',
      body: node,
      footer: el('button', { class: 'btn', onclick: () => finish(null) }, 'Cancel'),
      width: '860px',
    })

    // A click on the backdrop closes the modal without resolving; treat that as cancel.
    dialog.node.addEventListener('click', e => {
      if (e.target === dialog.node) finish(null)
    })

    reload()
  })
}

/** The shared grid + uploader used by both the page and the picker. */
function mediaBrowser({ selectable, onSelect }) {
  const query = { page: 1, limit: 40, search: '', folder: '' }

  const grid = el('div', { class: 'media-grid' })
  const pager = el('div', { class: 'pager' })
  const folderSelect = el('select', {
    style: { width: 'auto' },
    onchange: e => { query.folder = e.target.value; query.page = 1; reload() },
  }, el('option', { value: '' }, 'All folders'))

  const fileInput = el('input', {
    type: 'file',
    multiple: true,
    accept: 'image/*,application/pdf',
    style: { display: 'none' },
    onchange: e => upload(e.target.files),
  })

  const dropzone = el('div', {
    class: 'dropzone',
    onclick: () => fileInput.click(),
    ondragover: e => { e.preventDefault(); dropzone.classList.add('over') },
    ondragleave: () => dropzone.classList.remove('over'),
    ondrop: e => {
      e.preventDefault()
      dropzone.classList.remove('over')
      upload(e.dataTransfer.files)
    },
  },
    el('div', { style: { fontSize: '26px', marginBottom: '6px' } }, '⬆'),
    el('div', {}, el('b', {}, 'Drop files here'), ' or click to browse'),
    el('div', { class: 'hint', style: { marginTop: '4px' } },
      'Images are converted to WebP, resized, and stripped of EXIF metadata.'),
    fileInput,
  )

  async function upload(files) {
    if (!files?.length) return
    if (!can('media.write')) return toast('You do not have permission to upload', 'error')

    const form = new FormData()
    for (const file of files) form.append('files', file)

    clear(dropzone)
    dropzone.append(el('span', { class: 'spinner' }), ` Uploading ${files.length} file(s)…`)

    try {
      const res = await api.upload('/media', form)
      toast(`Uploaded ${res.data.length} file(s)`, 'success')
      await reload()
    } catch (err) {
      toast(err.message || 'Upload failed', 'error')
    } finally {
      rebuildDropzone()
      fileInput.value = '' // so re-picking the same file fires `change` again
    }
  }

  function rebuildDropzone() {
    clear(dropzone)
    dropzone.append(
      el('div', { style: { fontSize: '26px', marginBottom: '6px' } }, '⬆'),
      el('div', {}, el('b', {}, 'Drop files here'), ' or click to browse'),
      el('div', { class: 'hint', style: { marginTop: '4px' } },
        'Images are converted to WebP, resized, and stripped of EXIF metadata.'),
      fileInput,
    )
  }

  async function reload() {
    clear(grid)
    grid.append(el('div', { style: { padding: '30px' } }, el('span', { class: 'spinner' })))

    const res = await api.get('/media', query)
    clear(grid)
    clear(pager)

    // Keep the folder filter in sync with what actually exists.
    const folders = res.meta?.folders || []
    if (folderSelect.options.length - 1 !== folders.length) {
      clear(folderSelect)
      folderSelect.append(el('option', { value: '' }, 'All folders'))
      for (const f of folders) {
        folderSelect.append(el('option', { value: f, selected: query.folder === f }, f))
      }
    }

    if (!res.data.length) {
      grid.append(el('div', { class: 'empty', style: { gridColumn: '1/-1' } },
        el('div', { class: 'big' }, '🖼'),
        el('p', {}, query.search ? 'No matches.' : 'No files uploaded yet.'),
      ))
      return
    }

    for (const item of res.data) {
      const isImage = item.mimeType?.startsWith('image/')
      grid.append(el('div', {
        class: 'media-tile',
        onclick: () => (selectable ? onSelect(item) : details(item)),
        title: item.originalName,
      },
        el('div', {
          class: 'thumb',
          style: isImage ? { backgroundImage: `url("${item.thumbnailUrl || item.url}")` } : {},
        }, isImage ? '' : '📄'),
        el('div', { class: 'cap' },
          el('b', {}, item.alt || item.originalName),
          el('span', {}, `${bytes(item.size)}${item.width ? ` · ${item.width}×${item.height}` : ''}`),
        ),
      ))
    }

    if (res.meta.pages > 1) {
      pager.append(
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasPrev, onclick: () => { query.page--; reload() } }, '← Previous'),
        el('span', {}, `Page ${res.meta.page} of ${res.meta.pages}`),
        el('button', { class: 'btn btn-sm', disabled: !res.meta.hasNext, onclick: () => { query.page++; reload() } }, 'Next →'),
      )
    }
  }

  function details(item) {
    const alt = el('input', { type: 'text', value: item.alt || '' })
    const caption = el('input', { type: 'text', value: item.caption || '' })
    const folder = el('input', { type: 'text', value: item.folder || 'general' })

    const dialog = modal({
      title: item.originalName,
      body: el('div', { class: 'media-detail' },
        el('div', {},
          item.mimeType?.startsWith('image/')
            ? el('img', { src: item.url, style: { width: '100%', borderRadius: '6px', border: '1px solid var(--line)' } })
            : el('div', { class: 'img-preview', style: { width: '100%', height: '150px' } }, '📄'),
          el('div', { class: 'hint', style: { marginTop: '10px' } },
            el('div', {}, bytes(item.size)),
            item.width && el('div', {}, `${item.width} × ${item.height}px`),
            el('div', {}, formatDate(item.createdAt)),
          ),
        ),
        el('div', {},
          el('div', { class: 'field' }, el('label', {}, 'Alt text'), alt,
            el('div', { class: 'help' }, 'Describes the image for screen readers and search engines.')),
          el('div', { class: 'field' }, el('label', {}, 'Caption'), caption),
          el('div', { class: 'field' }, el('label', {}, 'Folder'), folder),
          el('div', { class: 'field' },
            el('label', {}, 'URL'),
            el('input', { type: 'text', class: 'mono', value: item.url, readonly: true, onclick: e => e.target.select() }),
          ),
        ),
      ),
      footer: [
        can('media.delete') && el('button', {
          class: 'btn btn-danger',
          onclick: async () => {
            const okDelete = await confirmDialog({
              title: 'Delete this file?',
              message: 'Any page still using it will show a broken image. This cannot be undone.',
            })
            if (!okDelete) return
            await api.del(`/media/${item._id}`)
            toast('File deleted', 'success')
            dialog.close()
            reload()
          },
        }, 'Delete'),
        can('media.write') && el('button', {
          class: 'btn btn-primary',
          onclick: async () => {
            await api.patch(`/media/${item._id}`, {
              alt: alt.value, caption: caption.value, folder: folder.value,
            })
            toast('Saved', 'success')
            dialog.close()
            reload()
          },
        }, 'Save'),
      ].filter(Boolean),
    })
  }

  const node = el('div', {},
    can('media.write') && dropzone,
    el('div', { class: 'toolbar' },
      el('div', { class: 'grow' },
        el('input', {
          type: 'search',
          placeholder: 'Search by name, alt text or tag…',
          oninput: debounce(e => { query.search = e.target.value; query.page = 1; reload() }, 320),
        }),
      ),
      folderSelect,
    ),
    grid,
    pager,
  )

  return { node, reload }
}
