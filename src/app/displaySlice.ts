import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';


interface DisplayState {
    settings : string
  }
  
  const initialState: DisplayState = {
      settings : "matrix(1, 0, 0, 1, 0, 0)"
  };

  export const slice = createSlice({
    name: 'displaySettings',
    initialState,
    reducers: {
        setDisplay : ( state, action : PayloadAction<string> ) => {
            state.settings = action.payload
        }
      }
    })
  
  export const { setDisplay } = slice.actions;
  export const selectDisplay = (state: RootState) => state.display.settings
  export default slice.reducer;