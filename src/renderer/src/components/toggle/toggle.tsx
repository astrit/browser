import './toggle.css'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
  id?: string
}

const Toggle = ({ checked, onChange, label, id }: ToggleProps): JSX.Element => {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch${checked ? ' is-on' : ''}`}
      id={id}
      onClick={onChange}
      role="switch"
      type="button"
    >
      <span className="toggle-label">{label}</span>
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </button>
  )
}

export default Toggle
