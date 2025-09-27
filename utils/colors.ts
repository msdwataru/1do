// 洗練されたカラーパレット - 欧米と日本の両方のユーザーに響くデザイン

export const lightColors = {
  // 背景色 - 柔らかく上品
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  
  // プライマリカラー - 落ち着いた青
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  
  // セカンダリカラー - 洗練された紫
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryDark: '#6D28D9',
  
  // アクセントカラー - 控えめで上品
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  
  // 成功・警告・エラー - 原色を避けた洗練された色
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  
  // テキスト - 読みやすさを重視
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // 境界線 - 控えめで上品
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // シャドウ - 自然で洗練
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
  
  // オーバーレイ - モーダル用
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  // グラデーション用
  gradientStart: '#F8FAFC',
  gradientEnd: '#E2E8F0',
};

export const darkColors = {
  // 背景色 - 深みのあるダーク
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  
  // プライマリカラー - ダークモード用に調整
  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#3B82F6',
  
  // セカンダリカラー - ダークモード用に調整
  secondary: '#A78BFA',
  secondaryLight: '#C4B5FD',
  secondaryDark: '#8B5CF6',
  
  // アクセントカラー - ダークモード用に調整
  accent: '#34D399',
  accentLight: '#6EE7B7',
  accentDark: '#10B981',
  
  // 成功・警告・エラー - ダークモード用に調整
  success: '#34D399',
  successLight: '#6EE7B7',
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  error: '#F87171',
  errorLight: '#FCA5A5',
  
  // テキスト - ダークモード用に調整
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // 境界線 - ダークモード用に調整
  border: '#475569',
  borderLight: '#64748B',
  borderDark: '#334155',
  
  // シャドウ - ダークモード用に調整
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.4)',
  
  // オーバーレイ - モーダル用
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // グラデーション用
  gradientStart: '#0F172A',
  gradientEnd: '#1E293B',
};

// カラーモードに応じた色を取得
export const getColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};

// セマンティックカラー（用途別）
export const semanticColors = {
  // 状態表示
  active: '#3B82F6',
  inactive: '#9CA3AF',
  pending: '#F59E0B',
  
  // 優先度
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
  
  // カテゴリ
  work: '#3B82F6',
  personal: '#8B5CF6',
  health: '#10B981',
  learning: '#F59E0B',
  finance: '#EF4444',
};

// グラデーション設定
export const gradients = {
  primary: ['#3B82F6', '#1D4ED8'],
  secondary: ['#8B5CF6', '#6D28D9'],
  accent: ['#10B981', '#059669'],
  surface: ['#F8FAFC', '#E2E8F0'],
  dark: ['#0F172A', '#1E293B'],
};

// 透明度付きカラー
export const withOpacity = (color: string, opacity: number) => {
  // 16進数カラーをRGBに変換して透明度を追加
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
