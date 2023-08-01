type NonEmptyArray<T> = [T, ...T[]]
export interface ContentConfig {
  matches: NonEmptyArray<string>
  shadowRoot?: boolean
  component?: React.ComponentType | string
}
