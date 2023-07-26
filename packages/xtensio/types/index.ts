export type Commands = "generate" | "build" | "dev";

export enum ExtensionOptionsKey {
  Background,
  Contentscript,
  Popup,
  ExtensionPages,
}

export type GenerateValues = "popup" | "page" | "contents" | "background";

export interface TemplateVariables {
  "app-name": string;
}

