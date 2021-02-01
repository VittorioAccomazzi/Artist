import React, {useRef, useState} from 'react'
import {makeStyles } from '@material-ui/core/styles';
import {isMobile} from 'react-device-detect';
import {UserEvent, NoEvent, Point, DeviceTypes, ButtonPress} from '../../app/types'
import PanZoom from './PanZoom'

const useStyles = makeStyles((theme) => ({
    mainDiv: {
        width:'100%',
        height:'100%',
        touchAction:'none'
    }
}))


export type EventRouterInfo = {
    children: React.ReactNode
}
export default function EventRouter({children} : EventRouterInfo) {
    const classes = useStyles()
    const [userEvent, setUserEvent] = useState<UserEvent>(NoEvent)

    // common functions
    const getMousePoint = ( event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.WheelEvent<HTMLDivElement> ) : Point => {
        let bounds = (event.currentTarget as Element ).getBoundingClientRect()
        let x = event.clientX - bounds.left
        let y = event.clientY - bounds.top
        return { x, y }
    }

    const getMouseWheel = ( event: React.WheelEvent<HTMLDivElement> ) : Point => {
        let x = event.deltaX
        let y = event.deltaY
        return { x, y }
    }

    const getTouchPoint = ( event:  React.TouchEvent<HTMLDivElement>  , index : number ) : Point => {
        let bounds = (event.target as Element ).getBoundingClientRect()
        let x = event.touches[index].clientX - bounds.left
        let y = event.touches[index].clientY - bounds.top
        return { x, y }
    }

    const getTouchPoints = ( event: React.TouchEvent<HTMLDivElement> ) : Point [] =>{
        let points = new Array<Point>(event.touches.length).fill({x:0,y:0})
        return  points.map((e,i)=>getTouchPoint(event,i))
    }

    // Mouse events
    const onMouseEvent = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>  {
        if( !isMobile ){
            setUserEvent({
                device : DeviceTypes.Mouse,
                event : {
                    button: event.buttons,
                    mousePoint : getMousePoint(event),
                    mouseWheel : {x:0,y:0}
                }
            })
        }
    }

    const onMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>{
        if( !isMobile ){
            setUserEvent({
                device : DeviceTypes.Mouse,
                event : {
                    button: event.buttons,
                    mousePoint : null,
                    mouseWheel : null
                }
            })
        }
    }

    const onMouseWheel = (event: React.WheelEvent<HTMLDivElement>) =>{
        if( !isMobile ){
            setUserEvent({
                device : DeviceTypes.Mouse,
                event : {
                    button: ButtonPress.Wheel,
                    mousePoint : getMousePoint(event),
                    mouseWheel : getMouseWheel(event)
                }
            })
        }
    }

    // touch Events
    const onTouch = ( event : React.TouchEvent<HTMLDivElement>) => {
        if( isMobile ){
            setUserEvent({
                device : DeviceTypes.Touch,
                event : {
                    pointers : getTouchPoints(event)
                }
            })
        }
    }

    return (
        <div className={classes.mainDiv}
            onMouseDown={onMouseEvent}
            onMouseMove={onMouseEvent}
            onMouseUp={onMouseEvent}
            onMouseLeave={onMouseLeave}
            onWheel={onMouseWheel}
            onTouchStart={onTouch}
            onTouchMove={onTouch}
            onTouchEnd={onTouch}
        >
                <PanZoom event={userEvent}/>            
                {children}
        </div>
    )
}