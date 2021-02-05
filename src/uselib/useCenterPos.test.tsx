import React, {useRef} from 'react';
import { render, fireEvent, cleanup as cleanupReact } from '@testing-library/react';
import useCenterPos from './useCenterPos'

  
describe('useCenterPos',()=>{
    beforeEach(() => {
        cleanupReact();
      });

      it('should be a function', () => {
        expect(useCenterPos).toBeDefined()
      });

      // Notice, since jesdom is not supporting DOMMatrix
      // no mch testing can be added here. 
      // https://github.com/jsdom/jsdom/issues/2647#issuecomment-621298595

})