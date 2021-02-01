import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';


interface ImageState {
    timestamp : number // timestamp last in memory pixel data change
  }
  
  const initialState: ImageState = {
      timestamp : Date.now()
  };

  export const slice = createSlice({
    name: 'imageSelected',
    initialState,
    reducers: {
        setTimestamp : (state)=>{
            state.timestamp = Date.now()
        }
      }
    })
  
  export const {setTimestamp } = slice.actions;
  export const selectTimestamp = (state: RootState) => state.image.timestamp
  export default slice.reducer;