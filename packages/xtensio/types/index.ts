export type Commands = "create" | "generate" | "build";

export enum ExtensionOptionsKey {
  Background,
  Contentscript,
  Popup,
  ExtensionPages,
}

export type CreateValues = string;
export type GenerateValues = "popup" | "page" | "contents" | "background";

export interface TemplateVariables {
  "app-name": string;
}

type NonEmptyArray<T> = [T, ...T[]];
export interface ContentConfig {
  matches: NonEmptyArray<string>;
  shadowRoot?: boolean;
  component?: React.ComponentType | string;
}
