// Web: tarayıcının kendi localStorage'ı; statik (sunucu) render sırasında yoktur
export const authStorage = typeof localStorage === 'undefined' ? undefined : localStorage;
