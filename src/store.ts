import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import painterReducer from './features/appMain/appWorker/painterSlice'
import downloadReducer from './features/appMain/downloadSlice'

export const store = configureStore({
  reducer: {
    painter : painterReducer,
    download: downloadReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;