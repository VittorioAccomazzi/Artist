import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import painterReducer from './features/appMain/appWorker/painterSlice'
import downloadReducer from './features/appMain/downloadSlice'
import progressReducer from './features/appMain/progressSlice'

export const store = configureStore({
  reducer: {
    painter : painterReducer,
    download: downloadReducer,
    progress: progressReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;