import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store'

export enum PainterType {
    Tensor =0,
    Bilateral=1
}
interface PainterState {
    painter : PainterType
  }
  
  const initialState: PainterState = {
    painter : PainterType.Tensor
  };

  export const slice = createSlice({
    name: 'PainterType',
    initialState,
    reducers: {
        setPainter : ( state, action : PayloadAction<PainterType> ) => {
            state.painter = action.payload
        }
      }
    })
  
  export const { setPainter } = slice.actions;
  export const selectPainter = (state: RootState) => state.painter.painter
  export default slice.reducer;