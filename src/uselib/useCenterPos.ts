import React, {useState,useEffect} from 'react'

interface Size  {
    width : number,
    height: number
}
const initSize = { width:0, height:0}

/**
 * computes the CSS transforation matrix which will center the `contEl` element inside `mainEl`
 * Listen to the resize event to adjust the matrix as necessary. Notice that the `contEl` requires
 * the following CSS for the matrix to work properly :
 * position: 'relative', transformOrigin: '0px 0px',
 * @param contEl element which has to be centered
 * @param mainEl container element
 * @param deps extra dependencies which shall trigger a recompute
 */
export default function useCenterPos(   contEl :  React.MutableRefObject<HTMLElement | null>,
                                        mainEl : React.MutableRefObject<HTMLElement | null>,
                                        deps   : React.DependencyList
                                        ) : DOMMatrix {
    const [pose, setPose] =  useState<DOMMatrix>(new DOMMatrix())
    const [size, setSize]= useState< Size>(initSize)

    useEffect(()=>{
        if( contEl.current != null && mainEl.current != null ) {
            let cont = contEl.current!
            let main = mainEl.current!
            let xScale = main.clientWidth/cont.clientWidth
            let yScale = main.clientHeight/cont.clientHeight
            let scale = Math.min(xScale,yScale)
            let dx = ( main.clientWidth - cont.clientWidth * scale )/2
            let dy = ( main.clientHeight - cont.clientHeight * scale )/2
            let matrix = `matrix( ${scale}, 0, 0, ${scale}, ${dx}, ${dy})`
            setPose( new DOMMatrix(matrix))
        }

    }, deps.concat([contEl, mainEl, size]))  // eslint-disable-line  react-hooks/exhaustive-deps

    // handle the window size.
    useEffect(()=>{
        function updateSize() {
            setSize( {
                width : window.outerWidth,
                height : window.outerHeight
            })
        }
        window.addEventListener('resize', updateSize)
        return ()=>{
            window.removeEventListener('resize',updateSize)
        }
    },[])

    return DOMMatrix.fromMatrix(pose) // return a copy to prevent to modify
}