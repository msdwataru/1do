import { CommonHeader } from '@/components/CommonHeader';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ADS, ADS_CONFIG } from '@/constants/Ads';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/utils/colors';
import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadTasks();
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

  const loadTasks = async () => {
    try {
      const tasksData = await AsyncStorage.getItem('tasks');
      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }
    } catch (error) {
      console.error('タスクの読み込みに失敗しました:', error);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('タスクの保存に失敗しました:', error);
    }
  };

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedTasks = [...tasks, newTask];
      await saveTasks(updatedTasks);
      setNewTaskTitle('');
      setShowAddModal(false);
    }
  };

  const editTask = async () => {
    if (editingTask && newTaskTitle.trim()) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, title: newTaskTitle.trim() }
          : task
      );
      
      await saveTasks(updatedTasks);
      setNewTaskTitle('');
      setEditingTask(null);
      setShowEditModal(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      i18n.t('tasks.deleteTask'),
      i18n.t('tasks.deleteTaskConfirm'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            await saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setShowEditModal(true);
  };

  const colors = getColors(isDarkMode);

  const getTodayString = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return today.toLocaleDateString(i18n.locale === 'ja' ? 'ja-JP' : 'en-US', options);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
      <CommonHeader
          title={i18n.t('tasks.title')}
          subtitle={i18n.t('tasks.subtitle')}
          date={getTodayString()}
        />

        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                  <IconSymbol name="plus.circle" size={80} color={colors.textTertiary} />
                </View>
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  {i18n.t('tasks.noTasksYet')}
                </ThemedText>
                <ThemedText style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                  {i18n.t('tasks.noTasksMessage')}
                </ThemedText>
              </View>
            ) : (
              [...tasks]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((task) => (
                <View
                  key={task.id}
                  style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.taskInfo}>
                    <View style={[styles.taskIcon, { backgroundColor: colors.background }]}>
                      <IconSymbol name="checklist.unchecked" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.taskDetails}>
                      <ThemedText style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
                        {task.title}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => openEditModal(task)}
                    >
                      <IconSymbol name="pencil" size={16} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={() => deleteTask(task.id)}
                    >
                      <IconSymbol name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* タスク追加ボタン */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setNewTaskTitle('');
            setShowAddModal(true);
          }}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>

        {/* タスク追加モーダル */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                {i18n.t('tasks.addNewTask')}
              </ThemedText>
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder={i18n.t('tasks.enterTaskTitle')}
                placeholderTextColor={colors.textTertiary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <ThemedText style={styles.modalButtonText}>
                    {i18n.t('cancel')}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={addTask}
                >
                  <ThemedText style={[styles.modalButtonText, { color: colors.textInverse }]}>
                    {i18n.t('add')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* タスク編集モーダル */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                {i18n.t('tasks.editTask')}
              </ThemedText>
              
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder={i18n.t('tasks.enterTaskTitle')}
                placeholderTextColor={colors.textTertiary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <ThemedText style={styles.modalButtonText}>
                    {i18n.t('cancel')}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={editTask}
                >
                  <ThemedText style={[styles.modalButtonText, { color: colors.textInverse }]}>
                    {i18n.t('save')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
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
  date: {
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingBottom: 100,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  adContainer: {
    position: 'absolute',
    bottom: 100, // タブバーの高さ分を考慮
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 10,
    alignItems: 'center',
  },
  adPlaceholder: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  adPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // 広告エリア分のパディングを追加
    gap: 20,
  },
});
