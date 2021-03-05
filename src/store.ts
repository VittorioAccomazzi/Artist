import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import painterReducer from './features/appMain/appWorker/painterSlice'

export const store = configureStore({
  reducer: {
    painter : painterReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;