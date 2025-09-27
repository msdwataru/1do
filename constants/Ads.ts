// 広告関連の定数
export const ADS = {
  // テスト用の広告ID（Google公式のテスト用ID）
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/2934735716',

  // バナー広告のユニットID
  BANNER_UNIT_ID: 'ca-app-pub-7497478024453080/1241363588',
} as const;

// 広告の設定
export const ADS_CONFIG = {
  // バナー広告のリクエストオプション
  BANNER_REQUEST_OPTIONS: {
    requestNonPersonalizedAdsOnly: true,
  },
  
  // バナーサイズ
  bannerSize: 'BANNER' as const,
} as const;
