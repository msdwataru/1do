import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';
import React from 'react';
import { StatusBar, StatusBarStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

interface CommonHeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  dateStyle?: TextStyle;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  subtitle,
  date,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const barStyle: StatusBarStyle = isDarkMode ? 'light-content' : 'dark-content';

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={colors.background}
        animated={true}
      />
      <View style={styles.container}>
        <ThemedText type="title" lightColor={colors.text} darkColor={colors.text}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            type="subtitle"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
          >
            {subtitle}
          </ThemedText>
        ) : null}
        {date ? (
          <ThemedText
            style={[styles.date, { color: colors.textSecondary }]}
          >
            {date}
          </ThemedText>
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  date: {
    fontSize: 16,
    fontWeight: '400',
  },
});
