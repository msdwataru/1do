import { CommonHeader } from '@/components/CommonHeader';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ADS, ADS_CONFIG } from '@/constants/Ads';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';
import { getTodayString } from '@/utils/getTodayString';
import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTask, setTodayTask] = useState<Task | null>(null);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

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

  useEffect(() => {
    if (tasks.length > 0) {
      checkTodayTask();
    }
  }, [tasks]);

  // 画面がフォーカスされた時にデータを再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const tasksData = await AsyncStorage.getItem('tasks');
      if (tasksData) {
        const parsedTasks = JSON.parse(tasksData);
        setTasks(parsedTasks);
      } else {
      }
    } catch (error) {
    }
  };

  const checkTodayTask = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayRecordData = await AsyncStorage.getItem(`record_${today}`);
      if (todayRecordData) {
        const record = JSON.parse(todayRecordData);
        setTodayRecord(record);
        
        // 今日のタスクを取得（tasksが読み込まれた後に実行）
        setTimeout(() => {
          const task = tasks.find(t => t.id === record.taskId);
          if (task) {
            setTodayTask(task);
          }
        }, 100);
      }
    } catch (error) {
      console.error('今日の記録の確認に失敗しました:', error);
    }
  };

  const selectTodayTask = async (task: Task) => {
    try {      
      const today = new Date().toISOString().split('T')[0];
      
      // 既存の記録がある場合は削除
      if (todayRecord) {
        await AsyncStorage.removeItem(`record_${today}`);
      }
      
      const record: DailyRecord = {
        date: today,
        taskId: task.id,
        status: null // 新しいタスクは常に未選択状態で開始
      };
      
      await AsyncStorage.setItem(`record_${today}`, JSON.stringify(record));
      setTodayTask(task);
      setTodayRecord(record);
      setShowTaskSelector(false);
      
    } catch (error) {
    }
  };

  const recordTaskStatus = async (status: 'completed' | 'uncompleted') => {
    if (!todayRecord) return;
    
    try {
      const updatedRecord = { ...todayRecord, status };
      const today = new Date().toISOString().split('T')[0];
      
      // 記録を保存
      await AsyncStorage.setItem(`record_${today}`, JSON.stringify(updatedRecord));
      setTodayRecord(updatedRecord);
      
      // カレンダーの更新を確実にするため、少し遅延してから保存
      setTimeout(async () => {
        await AsyncStorage.setItem(`record_${today}`, JSON.stringify(updatedRecord));
      }, 100);
      
      if (status === 'completed') {
        Alert.alert(
          i18n.t('home.congratulations'),
          i18n.t('home.achievementMessage')
        );
      } else {
        // uncompleted の場合でも通知
        Alert.alert(
          i18n.t('home.keepGoing'),
          i18n.t('home.notCompletedMessage')
        );
      }
    } catch (error) {
      console.error('記録の保存に失敗しました:', error);
    }
  };

  if (!todayTask) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <CommonHeader
            title={i18n.t('appName')}
            subtitle={i18n.t('home.selectTaskDescription')}
            date={getTodayString()}
          />
          
          <View style={styles.content}>
            <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
              <IconSymbol name="checklist.unchecked" size={80} color={colors.primary} />
            </View>
            <ThemedText style={[styles.message, { color: colors.text }]}>
              {i18n.t('home.selectTaskDescription')}
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.selectButton, { backgroundColor: colors.primary }]}
              onPress={async () => {
                await loadData(); // タスクデータを再読み込み
                setShowTaskSelector(true);
              }}
            >
              <ThemedText style={styles.selectButtonText}>
                {i18n.t('home.selectTask')}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showTaskSelector}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowTaskSelector(false)}
          >
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                  {i18n.t('home.selectTask')}
                </ThemedText>
                
                {tasks.length === 0 ? (
                  <ThemedText style={[styles.noTasksMessage, { color: colors.textSecondary }]}>
                    {i18n.t('tasks.noTasksMessage')}
                  </ThemedText>
                ) : (
                  <ScrollView>
                  {              
                    [...tasks]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[styles.taskItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => selectTodayTask(task)}
                      >
                        <ThemedText style={[styles.modalTaskTitle, { color: colors.text }]}>{task.title}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowTaskSelector(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    {i18n.t('cancel')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <CommonHeader
          title={i18n.t('appName')}
          subtitle={i18n.t('home.subtitle')}
          date={getTodayString()}
        />
        
        <View style={styles.content}>
          <View style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.taskIcon, { backgroundColor: colors.background }]}>
              <IconSymbol name="checklist.unchecked" size={60} color={colors.primary} />
            </View>
            <ThemedText style={[styles.taskTitle, { color: colors.text }]}>{todayTask.title}</ThemedText>
             
            {todayRecord?.status === 'completed' ? (
              <View style={styles.completedStatus}>
                <View style={[styles.statusIcon, { backgroundColor: colors.success }]}>
                  <IconSymbol name="checkmark.circle.fill" size={40} color="white" />
                </View>
                <ThemedText style={[styles.completedText, { color: colors.success }]}>
                  {i18n.t('home.completed')}
                </ThemedText>
                 
                <TouchableOpacity
                  style={[styles.changeTaskButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      // 古い記録を削除してからモーダルを開く
                      // 新しいタスクは常に未選択状態で開始される
                      const today = new Date().toISOString().split('T')[0];
                      await AsyncStorage.removeItem(`record_${today}`);
                      setTodayRecord(null);
                      setTodayTask(null);

                      await loadData();
                      setShowTaskSelector(true);
                    } catch (error) {
                      console.error('タスク変更処理でエラーが発生しました:', error);
                    }
                  }}
                >
                  <ThemedText style={styles.changeTaskButtonText}>
                    {i18n.t('home.changeTask')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : todayRecord?.status === 'uncompleted' ? (
              <View style={styles.uncompletedStatus}>
                <View style={[styles.statusIcon, { backgroundColor: colors.warning }]}>
                  <IconSymbol name="xmark.circle.fill" size={40} color="white" />
                </View>
                <ThemedText style={[styles.uncompletedText, { color: colors.warning }]}>
                  {i18n.t('home.notCompleted')}
                </ThemedText>
                 
                <TouchableOpacity
                  style={[styles.changeTaskButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      // 古い記録を削除してからモーダルを開く
                      // 新しいタスクは常に未選択状態で開始される
                      const today = new Date().toISOString().split('T')[0];
                      await AsyncStorage.removeItem(`record_${today}`);
                      setTodayRecord(null);
                      setTodayTask(null);

                      await loadData();
                      setShowTaskSelector(true);
                    } catch (error) {
                      console.error('タスク変更処理でエラーが発生しました:', error);
                    }
                  }}
                >
                  <ThemedText style={styles.changeTaskButtonText}>
                    {i18n.t('home.changeTask')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      await recordTaskStatus('completed');
                    } catch (error) {
                      console.error('記録処理でエラーが発生しました:', error);
                    }
                  }}
                >
                  <ThemedText style={styles.actionButtonText}>
                    {i18n.t('home.done')}
                  </ThemedText>
                </TouchableOpacity>
                 
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.warning }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      await recordTaskStatus('uncompleted');
                    } catch (error) {
                    }
                  }}
                >
                  <ThemedText style={styles.actionButtonText}>
                    {i18n.t('home.notToday')}
                  </ThemedText>
                </TouchableOpacity>
                 
                <TouchableOpacity
                  style={[styles.changeTaskButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    try {
                      // 古い記録を削除してからモーダルを開く
                      // 新しいタスクは常に未選択状態で開始される
                      const today = new Date().toISOString().split('T')[0];
                      await AsyncStorage.removeItem(`record_${today}`);
                      setTodayRecord(null);
                      setTodayTask(null);

                      await loadData();
                      setShowTaskSelector(true);
                    } catch (error) {
                      console.error('タスク変更処理でエラーが発生しました:', error);
                    }
                  }}
                >
                  <ThemedText style={styles.changeTaskButtonText}>
                    {i18n.t('home.changeTask')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Modal
          visible={showTaskSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTaskSelector(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                {i18n.t('home.selectTask')}
              </ThemedText>
               
              {tasks.length === 0 ? (
                <ThemedText style={[styles.noTasksMessage, { color: colors.textSecondary }]}>
                  {i18n.t('tasks.noTasksMessage')}
                </ThemedText>
              ) : (
                <ScrollView>
                {              
                [...tasks]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => selectTodayTask(task)}
                  >
                    <ThemedText style={[styles.modalTaskTitle, { color: colors.text }]}>{task.title}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              )}
               
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setShowTaskSelector(false)}
              >
                <ThemedText style={styles.cancelButtonText}>
                  {i18n.t('cancel')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    lineHeight: 28,
  },
  selectButton: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  taskCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  taskIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 32,
  },
  actionButtons: {
    gap: 16,
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  completedStatus: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  changeTaskButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  changeTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  uncompletedStatus: {
    alignItems: 'center',
  },
  uncompletedText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 20,
    fontWeight: '600',
  },
  taskItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalTaskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  noTasksMessage: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  adPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
