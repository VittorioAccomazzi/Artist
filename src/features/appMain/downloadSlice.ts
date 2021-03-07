import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'


interface DownloadState {
    download : boolean
  }
  
  const initialState: DownloadState = {
    download : false
  };

  export const slice = createSlice({
    name: 'DownloadAction',
    initialState,
    reducers: {
        setDownload : ( state, action : PayloadAction<boolean> ) => {
            state.download = action.payload
        }
      }
    })
  
  export const { setDownload } = slice.actions;
  export const selecDownload= (state: RootState) => state.download.download
  export default slice.reducer;