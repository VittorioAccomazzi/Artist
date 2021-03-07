import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'


interface ProgressState {
    current : number,
    total   : number
  }
  
  const initialState: ProgressState = {
    current : 0,
    total   : 0
  };

  export const slice = createSlice({
    name: 'Progress',
    initialState,
    reducers: {
        setProgress : ( state, action : PayloadAction<ProgressState> ) => {
            state.current = action.payload.current
            state.total   = action.payload.total
        }
      }
    })
  
  export const { setProgress } = slice.actions;
  export const selectProgress= (state: RootState) => state.progress
  export default slice.reducer;