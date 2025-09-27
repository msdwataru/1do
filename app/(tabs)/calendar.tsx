import { CommonHeader } from '@/components/CommonHeader';
import { ThemedText } from '@/components/ThemedText';
import { ADS, ADS_CONFIG } from '@/constants/Ads';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';
import { getTodayString } from '@/utils/getTodayString';
import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

// 広告関連のインポート（条件付き）
let BannerAd: any = null;
let BannerAdSize: any = null;
let MobileAds: any = null;

// Expo Go以外の環境でのみ広告ライブラリをインポート
if (Constants.appOwnership !== 'expo') {
  try {
    const adsModule = require('react-native-google-mobile-ads');
    BannerAd = adsModule.BannerAd;
    BannerAdSize = adsModule.BannerAdSize;
    MobileAds = adsModule.default;
  } catch (error) {
    console.log('広告ライブラリの読み込みに失敗しました:', error);
  }
}

interface Task {
  id: string;
  title: string;
  createdAt: string;
}

interface DailyRecord {
  date: string;
  taskId: string;
  status: 'completed' | 'uncompleted' | null;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadData();
    // 広告の初期化（Expo Go以外の環境でのみ）
    if (Constants.appOwnership !== 'expo' && MobileAds) {
      MobileAds()
        .initialize()
        .then((adapterStatuses: any) => {
          // 広告の初期化が完了
        })
        .catch((error: any) => {
          // 広告の初期化に失敗
        });
    }
  }, []);

  // 画面がフォーカスされた時にデータを再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // タスクを読み込み
      const tasksData = await AsyncStorage.getItem('tasks');
      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }

      // すべての日付の記録を読み込み
      const keys = await AsyncStorage.getAllKeys();
      const recordKeys = keys.filter(key => key.startsWith('record_'));
      
      const records: DailyRecord[] = [];
      for (const key of recordKeys) {
        try {
          const recordData = await AsyncStorage.getItem(key);
          if (recordData) {
            records.push(JSON.parse(recordData));
          }
        } catch (error) {
          console.error('記録の読み込みに失敗しました:', key, error);
        }
      }
      
      setDailyRecords(records);
      updateMarkedDates(records);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  };

  const updateMarkedDates = (records: DailyRecord[]) => {
    const marked: MarkedDates = {};
    
    records.forEach(record => {
      // statusがnullの場合はマークしない
      if (record.status === null) return;
      
      const colors = getColors(isDarkMode);
      marked[record.date] = {
        marked: true,
        dotColor: record.status === 'completed' ? colors.success : colors.warning,
        textColor: record.status === 'completed' ? colors.success : colors.warning,
        backgroundColor: record.status === 'completed' 
          ? colors.success + '20' // 20%の透明度
          : colors.warning + '20'
      };
    });
    
    setMarkedDates(marked);
  };

  const onDayPress = (day: DateData) => {
    const record = dailyRecords.find(r => r.date === day.dateString);
    if (record) {
      const task = tasks.find(t => t.id === record.taskId);
    } else {
    }
  };

  const getStats = () => {
    const completed = dailyRecords.filter(r => r.status === 'completed').length;
    const missed = dailyRecords.filter(r => r.status === 'uncompleted').length;
    const total = dailyRecords.length;
    
    return { completed, missed, total };
  };

  const colors = getColors(isDarkMode);
  const stats = getStats();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {i18n.t('calendar.title')}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {i18n.t('calendar.subtitle')}
          </ThemedText>
        </View> */}
        <CommonHeader
          title={i18n.t('calendar.title')}
          subtitle={i18n.t('calendar.subtitle')}
          date={getTodayString()}
        />

        <View style={styles.content}>
          {/* 統計カード */}
          <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.success }]}>
                {stats.completed}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {i18n.t('calendar.completed')}
              </ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.warning }]}>
                {stats.missed}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {i18n.t('calendar.missed')}
              </ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
                {stats.total}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {i18n.t('calendar.totalDays')}
              </ThemedText>
            </View>
          </View>

          {/* カレンダー */}
          <View style={[styles.calendarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="custom"
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.text,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.textInverse,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textTertiary,
                dotColor: colors.primary,
                selectedDotColor: colors.textInverse,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                indicatorColor: colors.primary,
                textDayFontWeight: '500',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>
        </View>
      </View>

      {/* 広告表示領域を常に確保 */}
      <View style={styles.adContainer}>
        {(() => {
          // Expo Go以外の環境（null, standalone, etc.）で広告ライブラリが利用可能な場合
          if (Constants.appOwnership !== 'expo' && BannerAd) {
            return (
              <BannerAd
                unitId={ADS.BANNER_UNIT_ID}
                size={BannerAdSize?.BANNER || 'BANNER'}
                requestOptions={ADS_CONFIG.BANNER_REQUEST_OPTIONS}
              />
            );
          } else {
            return (
              <View style={[styles.adPlaceholder, { opacity: Constants.appOwnership === 'expo' ? 0 : 1 }]}>
                <ThemedText style={[styles.adPlaceholderText, { color: colors.textSecondary }]}>
                  {Constants.appOwnership === 'expo' ? '広告エリア（Expo Goでは非表示）' : '広告エリア'}
                </ThemedText>
              </View>
            );
          }
        })()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingBottom: 100,
    gap: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  calendarContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  adContainer: {
    position: 'absolute',
    bottom: 100, // タブバーの高さ分を考慮
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  adPlaceholder: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  adPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
