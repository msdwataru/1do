import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// 日本語の翻訳
const ja = {
  // 共通
  appName: '1DO',
  cancel: 'キャンセル',
  save: '保存',
  delete: '削除',
  edit: '編集',
  add: '追加',
  done: '完了',
  loading: '読み込み中...',
  
  // タブ
  tabs: {
    home: 'ホーム',
    calendar: 'カレンダー',
    tasks: 'タスク',
    settings: '設定',
  },
  
  // ホーム画面
  home: {
    title: '今日のタスク',
    subtitle: '今日やること',
    selectTask: 'タスクを選択',
    selectTaskDescription: '今日は何を達成したいですか？',
    changeTask: 'タスクを変更',
    completed: '完了！',
    notCompleted: '未完了',
    done: 'できた！',
    notToday: 'できなかった',
    keepGoing: 'また明日がんばりましょう',
    tomorrowMessage: '今日のタスクはできませんでした💡',
    congratulations: 'おめでとうございます！',
    achievementMessage: '今日のタスクを達成しました！🎉',
    notCompletedMessage: '明日は必ず達成しましょう！💪',
  },
  
  // カレンダー画面
  calendar: {
    title: '進捗',
    subtitle: '日々の達成を記録',
    completed: '完了',
    missed: '未完了',
    totalDays: '総日数',
    noTaskRecorded: 'この日は記録がありません',
    task: 'タスク',
    status: '状態',
    completedStatus: '完了',
    notCompletedStatus: '未完了',
  },
  
  // タスク管理画面
  tasks: {
    title: 'タスク',
    subtitle: '日々の目標を管理',
    noTasksYet: 'まだタスクがありません',
    noTasksMessage: '最初のタスクを追加して、日々の焦点を始めましょう',
    addNewTask: '新しいタスクを追加',
    editTask: 'タスクを編集',
    enterTaskTitle: 'タスクのタイトルを入力...',
    created: '作成日',
    deleteTask: 'タスクを削除',
    deleteTaskConfirm: 'このタスクを削除してもよろしいですか？',
  },
  
  // 設定画面
  settings: {
    title: '設定',
    subtitle: '体験をカスタマイズ',
    theme: 'テーマ',
    darkMode: 'ダークモード',
    darkModeDescription: 'ライトテーマとダークテーマを切り替え',
    notifications: '通知',
    morningReminder: '朝のリマインダー',
    morningDescription: '朝8時に今日のタスク選択を促す通知',
    eveningReminder: '夜のリマインダー',
    eveningDescription: '夜8時に一日の振り返りを促す通知',
    morningTime: '朝の時間',
    eveningTime: '夜の時間',
    morningTimeDescription: '朝の通知時間を設定',
    eveningTimeDescription: '夜の通知時間を設定',
    appSettings: 'アプリ設定',
    resetAllData: 'すべてのデータをリセット',
    resetDescription: 'すべてのタスク、記録、設定をクリア',
    about: '1DOについて',
    aboutDescription: '1DOは、毎日1つの重要なタスクに集中することで、より良い習慣を築き、より意味のある結果を達成するのを助けるシンプルな習慣形成アプリです。',
    version: 'バージョン',
    permissionRequired: '通知の許可が必要です',
    permissionMessage: 'アプリの通知を受け取るには、通知の許可が必要です。',
    dataReset: 'データをリセット',
    dataResetConfirm: 'すべてのデータ（タスク、記録、設定）が削除されます。この操作は取り消せません。',
    resetComplete: '完了',
    resetMessage: 'すべてのデータがリセットされました。',
    error: 'エラー',
    resetError: 'データのリセットに失敗しました。',
  },
  
  // 通知
  notifications: {
    title: '1DO リマインダー',
    morningBody: 'おはようございます！今日は何を達成したいですか？',
    eveningBody: 'タスクの完了を記録しましょう。',
  },
  
  // 日付・時間
  date: {
    today: '今日',
    yesterday: '昨日',
    tomorrow: '明日',
  },
};

// 英語の翻訳
const en = {
  // Common
  appName: '1DO',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  done: 'Done',
  loading: 'Loading...',
  
  // タブ
  tabs: {
    home: 'Home',
    calendar: 'Calendar',
    tasks: 'Tasks',
    settings: 'Settings',
  },
  
  // Home screen
  home: {
    title: 'Today\'s Task',
    subtitle: 'Today\'s Focus',
    selectTask: 'Select Task',
    selectTaskDescription: 'What to do today?',
    changeTask: 'Change Task',
    completed: 'Completed!',
    notCompleted: 'Not Completed',
    done: 'Done!',
    notToday: 'Not Today',
    keepGoing: 'Keep Going!',
    tomorrowMessage: 'Tomorrow is another day 💪',
    congratulations: 'Congratulations!',
    achievementMessage: 'You\'ve completed today\'s task! 🎉',
    notCompletedMessage: 'Tomorrow is another day 💪',
  },
  
  // Calendar screen
  calendar: {
    title: 'Progress',
    subtitle: 'Track your daily achievements',
    completed: 'Completed',
    missed: 'Missed',
    totalDays: 'Total Days',
    noTaskRecorded: 'No task recorded for this date',
    task: 'Task',
    status: 'Status',
    completedStatus: 'Completed',
    notCompletedStatus: 'Not Completed',
  },
  
  // Task management screen
  tasks: {
    title: 'Tasks',
    subtitle: 'Manage your daily goals',
    noTasksYet: 'No tasks yet',
    noTasksMessage: 'Add your first task to get started with your daily focus',
    addNewTask: 'Add New Task',
    editTask: 'Edit Task',
    enterTaskTitle: 'Enter task title...',
    created: 'Created',
    deleteTask: 'Delete Task',
    deleteTaskConfirm: 'Are you sure you want to delete this task?',
  },
  
  // Settings screen
  settings: {
    title: 'Settings',
    subtitle: 'Customize your experience',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    darkModeDescription: 'Switch between light and dark themes',
    notifications: 'Notifications',
    morningReminder: 'Morning Reminder',
    morningDescription: 'Get reminded at 8:00 AM to choose your daily task',
    eveningReminder: 'Evening Reminder',
    eveningDescription: 'Get reminded at 8:00 PM to reflect on your day',
    morningTime: 'Morning Time',
    eveningTime: 'Evening Time',
    morningTimeDescription: 'Set morning notification time',
    eveningTimeDescription: 'Set evening notification time',
    appSettings: 'App Settings',
    resetAllData: 'Reset All Data',
    resetDescription: 'Clear all tasks, records, and settings',
    about: 'About 1DO',
    aboutDescription: '1DO is a simple habit-forming app that helps you focus on one important task each day. By limiting yourself to just one thing, you can build better habits and achieve more meaningful results.',
    version: 'Version',
    permissionRequired: 'Notification Permission Required',
    permissionMessage: 'You need to grant notification permission to receive app notifications.',
    dataReset: 'Reset Data',
    dataResetConfirm: 'All data (tasks, records, settings) will be deleted. This action cannot be undone.',
    resetComplete: 'Complete',
    resetMessage: 'All data has been reset.',
    error: 'Error',
    resetError: 'Failed to reset data.',
  },
  
  // Notifications
  notifications: {
    title: '1DO Reminder',
    morningBody: 'Good morning! What do you want to achieve today?',
    eveningBody: 'How was your day? Did you complete your tasks?',
  },
  
  // Date & Time
  date: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
  },
};

// i18nインスタンスの作成
const i18n = new I18n({
  ja,
  en,
});

// デフォルトロケールの設定
i18n.defaultLocale = 'ja';

// 端末の言語設定を自動取得
const getSystemLocale = () => {
  try {
    // システムの言語設定を確認
    const systemLocale = Localization.getLocales()[0]?.languageCode;
    if (systemLocale) {
      // 日本語の場合は'ja'、それ以外は'en'を返す
      return systemLocale === 'en' ? 'en' : 'ja';
    }
    // フォールバック: 英語
    return 'ja';
  } catch (error) {
    console.warn('ロケールの取得に失敗しました:', error);
    return 'ja';
  }
};

// 初期化時に端末の言語設定を適用
i18n.locale = getSystemLocale();
i18n.enableFallback = true;

export default i18n;
export { en, ja };

