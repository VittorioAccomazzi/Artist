import React, {useState,useEffect} from 'react'
import {isMobile} from 'react-device-detect';


//
// useMouse (um) events
//

export enum umDeviceTypes {
    None  =0,
    Touch =1,
    Mouse =2
}

export enum umButtonPress {
    Wheel=-1,
    None =0,
    Left =1,
    Right=2,
    LeftAndRight =3
} 

export type umPoint = {
    x: number,
    y: number
}
export type umTouchEvent = {
    pointers : umPoint []
}

export type umMouseEvent = {
    button : umButtonPress,
    mousePoint : umPoint | null // null when the mouse is leaving the window.
    mouseWheel : umPoint | null // null when the mouse is leaving the window.
}

export type umUserEvent = {
    device : umDeviceTypes,
    event  : umMouseEvent | umTouchEvent | null // null only in case of DeviceType.None
}

export const umNoEvent = { device : umDeviceTypes.None, event : null }

export function Point2DOM( point : umPoint ) : DOMPoint {
    return new DOMPoint(point.x, point.y, 0, 1)
}

export function DOM2Point( domPoint : DOMPoint ) : umPoint {
    return {
        x : domPoint.x,
        y : domPoint.y
    }
}

// this is based on :
//   https://github.com/beautifulinteractions/beautiful-react-hooks/blob/master/src/useMouseEvents.js and
//   https://github.com/beautifulinteractions/beautiful-react-hooks/blob/master/src/useMouseState.js
// with the following modification :
// - handling touch
// - returning an object, rather then a callback

export default function useMouse( targetRef :  React.MutableRefObject<HTMLElement | null> ) {
    const [userEvent, setUserEvent] = useState<umUserEvent>(umNoEvent)

    useEffect(()=>{
        // common functions
        const getMousePoint = ( event: MouseEvent | WheelEvent ) : umPoint => {
            let bounds = (event.currentTarget as Element ).getBoundingClientRect()
            let x = event.clientX - bounds.left
            let y = event.clientY - bounds.top
            return { x, y }
        }

        const getMouseWheel = ( event: WheelEvent ) : umPoint => {
            let x = event.deltaX
            let y = event.deltaY
            return { x, y }
        }

        const getTouchPoint = ( event:  TouchEvent , index : number ) : umPoint => {
            let bounds = (event.currentTarget as Element ).getBoundingClientRect()
            let x = event.touches[index].clientX - bounds.left
            let y = event.touches[index].clientY - bounds.top
            return { x, y }
        }

        const getTouchPoints = ( event: TouchEvent ) : umPoint [] =>{
            let points = new Array<umPoint>(event.touches.length).fill({x:0,y:0})
            return  points.map((e,i)=>getTouchPoint(event,i))
        }

        // Mouse events
        const onMouseEvent = (event: MouseEvent) =>  {
            if( !isMobile ){
                setUserEvent({
                    device : umDeviceTypes.Mouse,
                    event : {
                        button: event.buttons,
                        mousePoint : getMousePoint(event),
                        mouseWheel : {x:0,y:0}
                    }
                })
            }
        }

        const onMouseLeave = (event: MouseEvent) =>{
            if( !isMobile ){
                setUserEvent({
                    device : umDeviceTypes.Mouse,
                    event : {
                        button: event.buttons,
                        mousePoint : null,
                        mouseWheel : null
                    }
                })
            }
        }

        const onMouseWheel = (event: WheelEvent) =>{
            if( !isMobile ){
                event.preventDefault()
                setUserEvent({
                    device : umDeviceTypes.Mouse,
                    event : {
                        button: umButtonPress.Wheel,
                        mousePoint : getMousePoint(event),
                        mouseWheel : getMouseWheel(event)
                    }
                })
            }
        }

        // touch Events
        const onTouch = ( event : TouchEvent) => {
            if( isMobile ){
                setUserEvent({
                    device : umDeviceTypes.Touch,
                    event : {
                        pointers : getTouchPoints(event)
                    }
                })
            }
        }

        if( targetRef.current != null ){
            let htmlEl = targetRef.current
            htmlEl.addEventListener('mousedown', onMouseEvent)
            htmlEl.addEventListener('mousemove',onMouseEvent)
            htmlEl.addEventListener('mouseup',onMouseEvent)
            htmlEl.addEventListener('mouseleave',onMouseLeave)
            htmlEl.addEventListener('wheel',onMouseWheel)
            htmlEl.addEventListener('touchstart', onTouch)
            htmlEl.addEventListener('touchmove',onTouch)
            htmlEl.addEventListener('touchend',onTouch)

            return ()=>{
                htmlEl.removeEventListener('mousedown', onMouseEvent)
                htmlEl.removeEventListener('mousemove',onMouseEvent)
                htmlEl.removeEventListener('mouseup',onMouseEvent)
                htmlEl.removeEventListener('mouseleave',onMouseLeave)
                htmlEl.removeEventListener('wheel',onMouseWheel)
                htmlEl.removeEventListener('touchstart', onTouch)
                htmlEl.removeEventListener('touchmove',onTouch)
                htmlEl.removeEventListener('touchend',onTouch)            
            }
        }
    },[targetRef])

    return ( userEvent  )
}