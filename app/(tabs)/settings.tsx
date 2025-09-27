import { CommonHeader } from '@/components/CommonHeader';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';
import { getTodayString } from '@/utils/getTodayString';
import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationSettings {
  morning: boolean;
  evening: boolean;
  morningTime: string; // HH:mm形式
  eveningTime: string; // HH:mm形式
}

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    morning: true,
    evening: true,
    morningTime: '08:00',
    eveningTime: '22:00',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'morning' | 'evening'>('morning');
  const [tempTime, setTempTime] = useState('08:00');
  const [tempHour, setTempHour] = useState('08');
  const [tempMinute, setTempMinute] = useState('00');
  const { isDarkMode, setIsDarkMode } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    requestNotificationPermissions();

    // ✅ 通知ハンドラーを追加（iOSでフォアグラウンド時にも表示するため）
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,      // Android & fallback
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,     // iOS でバナー表示
        shouldShowList: true,       // iOS の通知センターに表示
      }),
    });
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        i18n.t('settings.permissionRequired'),
        i18n.t('settings.permissionMessage'),
        [{ text: 'OK' }]
      );
    }
  };

  const openTimePicker = (mode: 'morning' | 'evening') => {
    setTimePickerMode(mode);
    const time = mode === 'morning' ? notificationSettings.morningTime : notificationSettings.eveningTime;
    const [hour, minute] = time.split(':');
    setTempHour(hour);
    setTempMinute(minute);
    setShowTimePicker(true);
  };

  const saveTime = () => {
    const formattedTime = `${tempHour.padStart(2, '0')}:${tempMinute.padStart(2, '0')}`;
    if (timePickerMode === 'morning') {
      saveSettings({ ...notificationSettings, morningTime: formattedTime });
    } else {
      saveSettings({ ...notificationSettings, eveningTime: formattedTime });
    }
    setShowTimePicker(false);
  };

  const validateTimeInput = (hour: string, minute: string) => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const validateTimeFormat = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem('notificationSettings');
      if (settingsData) {
        setNotificationSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  const saveSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
      updateNotificationSchedule(settings);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  };

  const updateNotificationSchedule = async (settings: NotificationSettings) => {
    // 既存の通知をキャンセル
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (settings.morning) {
      await scheduleNotification('morning', settings.morningTime);
    }

    if (settings.evening) {
      await scheduleNotification('evening', settings.eveningTime);
    }
  };

  const scheduleNotification = async (type: 'morning' | 'evening', time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
  
    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    };
  
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.title'),
        body:
          type === 'morning'
            ? i18n.t('notifications.morningBody')
            : i18n.t('notifications.eveningBody'),
        data: { type, screen: 'index' },
      },
      trigger,
    });
  };

  const resetData = async () => {
    Alert.alert(
      i18n.t('settings.dataReset'),
      i18n.t('settings.dataResetConfirm'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('settings.resetAllData'),
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);
              
              setNotificationSettings({ 
                morning: true, 
                evening: true, 
                morningTime: '08:00', 
                eveningTime: '22:00' 
              });
              await Notifications.cancelAllScheduledNotificationsAsync();
              
              Alert.alert(i18n.t('settings.resetComplete'), i18n.t('settings.resetMessage'));
            } catch (error) {
              console.error('データのリセットに失敗しました:', error);
              Alert.alert(i18n.t('settings.error'), i18n.t('settings.resetError'));
            }
          },
        },
      ]
    );
  };

  const colors = getColors(isDarkMode);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <CommonHeader
          title={i18n.t('settings.title')}
          subtitle={i18n.t('settings.subtitle')}
          date={getTodayString()}
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* テーマ設定 */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
                <IconSymbol name="paintbrush" size={24} color="white" />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {i18n.t('settings.theme')}
              </ThemedText>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  {i18n.t('settings.darkMode')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.darkModeDescription')}
                </ThemedText>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.surface : colors.background}
              />
            </View>
          </View>

          {/* 通知設定 */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary }]}>
                <IconSymbol name="bell" size={24} color="white" />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {i18n.t('settings.notifications')}
              </ThemedText>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  {i18n.t('settings.morningReminder')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.morningDescription')}
                </ThemedText>
              </View>
              <Switch
                value={notificationSettings.morning}
                onValueChange={(value) => 
                  saveSettings({ ...notificationSettings, morning: value })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.surface : colors.background}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  {i18n.t('settings.morningTime')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.morningTimeDescription')}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: colors.primary }]}
                onPress={() => openTimePicker('morning')}
              >
                <ThemedText style={[styles.timeButtonText, { color: 'white', fontWeight: '700' }]}>
                  {notificationSettings.morningTime}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  {i18n.t('settings.eveningReminder')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.eveningDescription')}
                </ThemedText>
              </View>
              <Switch
                value={notificationSettings.evening}
                onValueChange={(value) => 
                  saveSettings({ ...notificationSettings, evening: value })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDarkMode ? colors.surface : colors.background}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
                  {i18n.t('settings.eveningTime')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.eveningTimeDescription')}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: colors.primary }]}
                onPress={() => openTimePicker('evening')}
              >
                <ThemedText style={[styles.timeButtonText, { color: 'white', fontWeight: '700' }]}>
                  {notificationSettings.eveningTime}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* アプリ設定
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.warning }]}>
                <IconSymbol name="gear" size={24} color="white" />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {i18n.t('settings.appSettings')}
              </ThemedText>
            </View>
            
            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={resetData}
            >
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingLabel, { color: colors.warning }]}>
                  {i18n.t('settings.resetAllData')}
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {i18n.t('settings.resetDescription')}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View> */}

          {/* アプリ情報 */}
          <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
                <IconSymbol name="info.circle" size={24} color="white" />
              </View>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                {i18n.t('settings.about')}
              </ThemedText>
            </View>
            
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              {i18n.t('settings.aboutDescription')}
            </ThemedText>
            
            <View style={styles.versionInfo}>
              <ThemedText style={[styles.versionText, { color: colors.textSecondary }]}>
                {i18n.t('settings.version')} 1.0.0
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 時間選択モーダル */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              {timePickerMode === 'morning' 
                ? i18n.t('settings.morningTime') 
                : i18n.t('settings.eveningTime')
              }
            </ThemedText>
            
            <View style={styles.timeInputContainer}>
              <TextInput
                style={[styles.timeInput, { 
                  borderColor: colors.border, 
                  color: colors.text,
                  backgroundColor: colors.background
                }]}
                value={tempHour}
                onChangeText={setTempHour}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="HH"
                placeholderTextColor={colors.textSecondary}
              />
              <ThemedText style={[styles.timeInputSeparator, { color: colors.text }]}>
                :
              </ThemedText>
              <TextInput
                style={[styles.timeInput, { 
                  borderColor: colors.border, 
                  color: colors.text,
                  backgroundColor: colors.background
                }]}
                value={tempMinute}
                onChangeText={setTempMinute}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowTimePicker(false)}
              >
                <ThemedText style={styles.modalButtonText}>
                  {i18n.t('cancel')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: validateTimeInput(tempHour, tempMinute) ? colors.primary : colors.border,
                    opacity: validateTimeInput(tempHour, tempMinute) ? 1 : 0.5
                  }
                ]}
                onPress={saveTime}
                disabled={!validateTimeInput(tempHour, tempMinute)}
              >
                <ThemedText style={[
                  styles.modalButtonText, 
                  { color: validateTimeInput(tempHour, tempMinute) ? colors.textInverse : colors.textSecondary }
                ]}>
                  {i18n.t('save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  date: {
    fontSize: 16,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    height: '100%',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
  },
  timeInputSeparator: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
