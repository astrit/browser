export type ExtensionActionHandler = () => void

export type ExtensionWindowViewComponent = () => JSX.Element

export interface ExtensionApp {
  id: string
  name: string
  description: string
  action: string
  windowView?: string
  runAction?: ExtensionActionHandler
  renderWindowView?: ExtensionWindowViewComponent
}
