import { ViewStyle } from 'react-native';
import { AppTheme } from './theme';

type GlassDepth = 'soft' | 'medium' | 'strong';

const depthElevation: Record<GlassDepth, number> = {
  soft: 2,
  medium: 5,
  strong: 8,
};

export function glassPanel(theme: AppTheme, depth: GlassDepth = 'medium'): ViewStyle {
  const level = depth === 'soft' ? theme.colors.elevation.level1 : depth === 'medium' ? theme.colors.elevation.level2 : theme.colors.elevation.level3;
  const borderAlpha = theme.dark
    ? depth === 'soft' ? 0.55 : depth === 'medium' ? 0.62 : 0.7
    : depth === 'soft' ? 0.36 : depth === 'medium' ? 0.44 : 0.52;

  return {
    backgroundColor: level,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.outlineVariant, borderAlpha),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.dark ? 0.3 : 0.12,
    shadowRadius: depthElevation[ depth ] + 4,
    elevation: depthElevation[ depth ],
    overflow: 'hidden',
  };
}

export function glassFloating(theme: AppTheme): ViewStyle {
  return {
    ...glassPanel(theme, 'strong'),
    borderRadius: 16,
    borderColor: withAlpha(theme.colors.outline, theme.dark ? 0.5 : 0.32),
  };
}

export function glassInput(theme: AppTheme): ViewStyle {
  return {
    ...glassPanel(theme, 'soft'),
    borderRadius: 12,
    paddingHorizontal: 2,
  };
}

export function glassPill(theme: AppTheme, selected: boolean): ViewStyle {
  if (selected) {
    return {
      ...glassPanel(theme, 'medium'),
      backgroundColor: withAlpha(theme.colors.primaryContainer, theme.dark ? 0.92 : 0.78),
      borderRadius: 12,
    };
  }

  return {
    ...glassPanel(theme, 'soft'),
    borderRadius: 12,
  };
}

export function withAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  if (!color.startsWith('#')) return color;

  if (color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  if (color.length === 4) {
    const r = parseInt(color[ 1 ] + color[ 1 ], 16);
    const g = parseInt(color[ 2 ] + color[ 2 ], 16);
    const b = parseInt(color[ 3 ] + color[ 3 ], 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  return color;
}