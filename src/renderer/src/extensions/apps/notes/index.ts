import type { ExtensionApp } from '../../types'
import notesView from './notes'

export const notes: ExtensionApp = {
  id: 'notes',
  name: 'notes',
  description: 'notes',
  action: 'notes',
  windowView: 'notes',
  runAction: () => {
    window.api.openNotesWindow()
  },
  renderWindowView: notesView
}
