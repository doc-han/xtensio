export type Commands = "create" | "generate";

export enum ExtensionOptionsKey {
  Background,
  Contentscript,
  Popup,
  ExtensionPages,
}

export type CreateValues = string;
export type GenerateValues = "popup" | "page" | "contentscript";
