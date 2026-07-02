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
  },
  dark: {
    text: cafeAtlasBrand.palette.paper,
    background: cafeAtlasBrand.palette.espresso,
    tint: tintColorDark,
    icon: '#bda995',
    tabIconDefault: '#bda995',
    tabIconSelected: tintColorDark,
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
