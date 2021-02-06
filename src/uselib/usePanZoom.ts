import React, {useState,useEffect,useRef} from 'react'
import useMouse, {umDeviceTypes, umPoint, umMouseEvent, umTouchEvent, umButtonPress} from './useMouse'

const minZoom = 0.1
const maxZoom = 10

/**
 * Listen to the mouse events and return the DOM matrix which allows to pan and zoom the content 
 * of the `targetRef`. The children of this object shall have the following CSS for  the  matrix
 * to work properly : `position: 'relative', transformOrigin: '0px 0px', transform: mat`
 * @param targetRef element which content shall be pan ad zoomed. 
 * @param deps list of dependencies, which will trigger the reset of the pan and zoom parameters.
 */
export default function usePanZoom( targetRef :  React.MutableRefObject<HTMLElement | null> ,
                                    deps   : React.DependencyList) : DOMMatrix {
    const [mat, setMat] = useState<DOMMatrix>(new DOMMatrix())
    const prvPoint = useRef<umPoint|null>(null)
    const prvDist  = useRef<number|null>(null)
    const event = useMouse(targetRef)

    useEffect(()=>{
        setMat(new DOMMatrix())
    },deps) // eslint-disable-line  react-hooks/exhaustive-deps

    useEffect(()=>{

        // common function
        const doPanZoom = ( dx : number, dy : number, x: number, y : number, scale : number ) => {
            let settings = DOMMatrix.fromMatrix(mat)

            let cZoom = settings.a // current zoom
            if( cZoom < minZoom ) scale = Math.max(1.0, scale )
            if( cZoom > maxZoom ) scale = Math.min(1.0, scale )

            // pan
            let pan = new DOMMatrix()
            pan.translateSelf(dx, dy, 0)
            settings.preMultiplySelf(pan)

            // zoom
            let zoom = new DOMMatrix()
            zoom.scaleSelf(scale, scale, 1.0, x, y, 0)
            settings.preMultiplySelf(zoom)
            setMat(settings)
        }

        // Mouse events
        const processMouseEvent = ( e : umMouseEvent  )=>{
            if( e.button !== umButtonPress.None && e.mousePoint && e.mouseWheel ){
                if( e.button === umButtonPress.Wheel ){
                    // zoom
                    let ds=1-e.mouseWheel.y/100;
                    doPanZoom(0, 0, e.mousePoint.x, e.mousePoint.y,ds)
                    prvPoint.current = null
                } else {
                    // user moving the mouse with button pressed.
                    if( prvPoint.current ){
                        // mouse move
                        let dx = e.mousePoint.x - prvPoint.current.x 
                        let dy = e.mousePoint.y - prvPoint.current.y
                        doPanZoom(dx, dy, 0, 0, 1)
                    } 
                    prvPoint.current = e.mousePoint
                }
            } else {
                prvPoint.current = null // done.
            }
        }

        const midPoint = ( pointers : umPoint [] ) : umPoint => {
            let x = ( pointers[0].x + pointers[1].x )/2
            let y = ( pointers[0].y + pointers[1].y )/2
            return { x, y }
        }
        const distance = ( pointers : umPoint [] ) : number => {
            let dx = ( pointers[0].x - pointers[1].x )
            let dy = ( pointers[0].y - pointers[1].y )
            return Math.sqrt(dx*dx+dy*dy)
        }

        // touch events
        const processTouchEvent = ( e : umTouchEvent )=>{
            if( e.pointers !=null && e.pointers.length > 0 ){
                if( e.pointers.length === 1 ){
                    if(  prvPoint.current && prvDist.current == null ){ // prvDst is not null when there are two touches
                        let dx = e.pointers[0].x - prvPoint.current.x 
                        let dy = e.pointers[0].y - prvPoint.current.y           
                        doPanZoom(dx, dy, 0, 0, 1.0) // only pan
                    } 
                    prvPoint.current = e.pointers[0]
                    prvDist.current = null
                } else if( e.pointers.length === 2 ) {
                    let mid = midPoint(e.pointers)
                    let dst = distance(e.pointers)
                    if( prvPoint.current && prvDist.current ){
                        let dx = mid.x - prvPoint.current.x 
                        let dy = mid.y - prvPoint.current.y 
                        let scale = dst/prvDist.current
                        doPanZoom(dx, dy, mid.x, mid.y, scale)
                    } 
                    prvPoint.current = mid
                    prvDist.current = dst
                }
            } else {
                // no touches
                prvPoint.current = null // done.
                prvDist.current = null  
            }
        }

        switch( event.device ){
            case umDeviceTypes.Mouse: 
                processMouseEvent(event.event as umMouseEvent);
                break;
            case umDeviceTypes.Touch:
                processTouchEvent(event.event as umTouchEvent)
        }

    },[event]) // eslint-disable-line  react-hooks/exhaustive-deps

    return DOMMatrix.fromMatrix(mat) // return a copy to prevent that it gets modified.
}