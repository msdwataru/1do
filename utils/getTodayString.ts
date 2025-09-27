import i18n from "./i18n";

export const getTodayString = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return today.toLocaleDateString(i18n.locale === 'ja' ? 'ja-JP' : 'en-US', options);
};