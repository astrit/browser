import { notes } from './apps/notes'
import { cmd } from './apps/cmd'
import type { ExtensionApp, ExtensionWindowViewComponent } from './types'

export const extensionApps: ExtensionApp[] = [notes, cmd]

export const runExtensionAction = (action: string): void => {
  const extension = extensionApps.find((entry) => entry.action === action)
  extension?.runAction?.()
}

export const getExtensionWindowView = (
  view: string | null
): ExtensionWindowViewComponent | null => {
  if (!view) {
    return null
  }

  const extension = extensionApps.find((entry) => entry.windowView === view)
  return extension?.renderWindowView ?? null
}
