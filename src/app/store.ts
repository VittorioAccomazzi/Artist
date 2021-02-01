import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import imageReducer from './imageSlice'
import dispayReducer from './displaySlice'

export const store = configureStore({
  reducer: {
    image   : imageReducer,
    display: dispayReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;