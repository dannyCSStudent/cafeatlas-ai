/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { cafeAtlasBrand } from '@repo/ui/brand';

const tintColorLight = cafeAtlasBrand.palette.ember;
const tintColorDark = cafeAtlasBrand.palette.paper;

export const Colors = {
  light: {
    text: cafeAtlasBrand.palette.bean,
    background: cafeAtlasBrand.palette.crema,
    tint: tintColorLight,
    icon: cafeAtlasBrand.palette.cocoa,
    tabIconDefault: cafeAtlasBrand.palette.cocoa,
    tabIconSelected: tintColorLight,
    surface: cafeAtlasBrand.palette.paper,
    surfaceStrong: cafeAtlasBrand.palette.paper,
    surfaceMuted: cafeAtlasBrand.palette.cremaDeep,
    border: "rgba(120, 85, 50, 0.18)",
    borderStrong: "rgba(120, 85, 50, 0.24)",
    mutedText: cafeAtlasBrand.palette.cocoa,
    accent: cafeAtlasBrand.palette.molasses,
    accentForeground: cafeAtlasBrand.palette.paper,
    success: "#def3df",
    successForeground: "#2f6b3f",
    inverse: cafeAtlasBrand.palette.espresso,
    inverseForeground: cafeAtlasBrand.palette.paper,
    inverseMuted: "#c8b7aa",
  },
  dark: {
    text: cafeAtlasBrand.palette.paper,
    background: cafeAtlasBrand.palette.espresso,
    tint: tintColorDark,
    icon: '#bda995',
    tabIconDefault: '#bda995',
    tabIconSelected: tintColorDark,
    surface: "#19110d",
    surfaceStrong: "#241913",
    surfaceMuted: "#2d2018",
    border: "rgba(255, 232, 210, 0.16)",
    borderStrong: "rgba(255, 232, 210, 0.22)",
    mutedText: "#d3c1b4",
    accent: cafeAtlasBrand.palette.paper,
    accentForeground: cafeAtlasBrand.palette.espresso,
    success: "rgba(17, 69, 44, 0.58)",
    successForeground: "#d6f1dc",
    inverse: cafeAtlasBrand.palette.paper,
    inverseForeground: cafeAtlasBrand.palette.espresso,
    inverseMuted: "#5d4f45",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
