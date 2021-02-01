import React from 'react';
import {useEffect,useRef} from 'react'
import {useSelector, useDispatch } from "react-redux";
import {setDisplay, selectDisplay} from '../../app/displaySlice'
import {DeviceTypes, Point, MouseEvent, TouchEvent, ButtonPress, UserEvent} from '../../app/types'


export interface PanZoomInfo {
    event : UserEvent
}
export default function PanZoom({event} : PanZoomInfo) : JSX.Element {
    const dispatch= useDispatch()
    const dSettings= useSelector(selectDisplay)
    const prvPoint = useRef<Point|null>(null)
    const prvDist  = useRef<number|null>(null)
  
    useEffect(()=>{

        // common function
        const doPanZoom = ( dx : number, dy : number, x: number, y : number, scale : number ) => {
            let settings = new DOMMatrix(dSettings)

            // pan
            let pan = new DOMMatrix()
            pan.translateSelf(dx, dy, 0)
            settings.preMultiplySelf(pan)

            // zoom
            let zoom = new DOMMatrix()
            zoom.scaleSelf(scale, scale, 1.0, x, y, 0)
            settings.preMultiplySelf(zoom)
            dispatch(setDisplay(settings.toString()))
        }

            // Mouse events
            const processMouseEvent = ( e : MouseEvent  )=>{
                if( e.button !== ButtonPress.None && e.mousePoint && e.mouseWheel ){
                    if( e.button === ButtonPress.Wheel ){
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

            const midPoint = ( pointers : Point [] ) : Point => {
                let x = ( pointers[0].x + pointers[1].x )/2
                let y = ( pointers[0].y + pointers[1].y )/2
                return { x, y }
            }
            const distance = ( pointers : Point [] ) : number => {
                let dx = ( pointers[0].x - pointers[1].x )
                let dy = ( pointers[0].y - pointers[1].y )
                return Math.sqrt(dx*dx+dy*dy)
            }

            // touch events
            const processTouchEvent = ( e : TouchEvent )=>{
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
                case DeviceTypes.Mouse: 
                    processMouseEvent(event.event as MouseEvent);
                    break;
                case DeviceTypes.Touch:
                    processTouchEvent(event.event as TouchEvent)
            }
    // on purpose do not add as reference dSettings, since this function will
    // change it and will create a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[event])

    return ( <></> )
}