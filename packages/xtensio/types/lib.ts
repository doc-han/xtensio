type NonEmptyArray<T> = [T, ...T[]]
export interface ContentConfig {
  matches: NonEmptyArray<string>
  shadowRoot?: boolean
  component?: React.ComponentType | string
}

export type MountComponent<T = {}> = React.FC<T & { unmount?: () => void }>
export type MC<T = {}> = MountComponent<T>
