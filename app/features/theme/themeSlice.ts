import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

interface ThemeState {
  isDark: boolean;
  isSystemTheme: boolean;
}

const initialState: ThemeState = {
  isDark: Appearance.getColorScheme() === 'dark',
  isSystemTheme: true,
};

const themeSlice = createSlice({
  name: 'THEME',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      state.isSystemTheme = false;
      AsyncStorage.setItem('isDarkTheme', JSON.stringify(state.isDark));
      AsyncStorage.setItem('isSystemTheme', 'false');
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      state.isSystemTheme = false;
      AsyncStorage.setItem('isDarkTheme', JSON.stringify(action.payload));
      AsyncStorage.setItem('isSystemTheme', 'false');
    },
    useSystemTheme: (state) => {
      state.isSystemTheme = true;
      state.isDark = Appearance.getColorScheme() === 'dark';
      AsyncStorage.setItem('isSystemTheme', 'true');
      AsyncStorage.removeItem('isDarkTheme');
    },
    loadTheme: (
      state,
      action: PayloadAction<{ isDark: boolean; isSystemTheme: boolean }>
    ) => {
      state.isDark = action.payload.isDark;
      state.isSystemTheme = action.payload.isSystemTheme;
    },
  },
});

export const { toggleTheme, setTheme, useSystemTheme, loadTheme } =
  themeSlice.actions;
export default themeSlice.reducer;
