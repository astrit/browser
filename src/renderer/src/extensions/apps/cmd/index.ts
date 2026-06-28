import type { ExtensionApp } from '../../types'
import cmdView from './cmd'

export const cmd: ExtensionApp = {
  id: 'cmd',
  name: 'cmd',
  description: 'cmd',
  action: 'cmd',
  windowView: 'cmd',
  runAction: () => {
    window.api.openCmdWindow()
  },
  renderWindowView: cmdView
}
