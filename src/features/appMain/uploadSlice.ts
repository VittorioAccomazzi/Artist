import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'


interface UpState {
    upload : boolean
  }
  
  const initialState: UpState = {
    upload : false
  };

  export const slice = createSlice({
    name: 'UploadAction',
    initialState,
    reducers: {
      setUpload : ( state, action : PayloadAction<boolean> ) => {
            state.upload = action.payload
        }
      }
    })
  
  export const { setUpload } = slice.actions;
  export const selecUpload= (state: RootState) => state.upload.upload
  export default slice.reducer;