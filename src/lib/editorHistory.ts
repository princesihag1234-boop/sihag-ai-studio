import type { Settings } from "./imageEngine";

export type EditorSnapshot = {
  imageSrc: string | null;
  fileName: string;

  settings: Settings;

  rotation: number;
  straighten: number;

  flipHorizontal: boolean;
  flipVertical: boolean;
};

export function cloneSettings(
  settings: Settings
): Settings {
  return {
    ...settings,
  };
}