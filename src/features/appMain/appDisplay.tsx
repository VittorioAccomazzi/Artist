import React, {useState, useEffect,useRef} from 'react'
import { useSelector, useDispatch } from "react-redux";
import {setTimestamp} from '../../app/imageSlice'
import {setDisplay} from '../../app/displaySlice'
import { makeStyles } from '@material-ui/core/styles';
import Viewport from './Viewport'
import EventRouter from './EventsRouter'

const useStyles = makeStyles((theme) => ({
    mainDiv:   {
        width:'100%',
        height:'100%' 
        }
    }))

export interface AppDisplayInfo  {
    imagePath : string
}

export default function AppDisplay({imagePath} : AppDisplayInfo){
    const [isloading, setLoading] = useState<Boolean>(true)  
    let canvas = useRef<HTMLCanvasElement|null>(null)
    let mDiv  = useRef<HTMLDivElement|null>(null) 
    const dispatch = useDispatch();
    const classes  = useStyles();

    useEffect(()=>{
        if( imagePath === null ) return;
        setLoading(true)
        let img = document.createElement('img') as HTMLImageElement
        img.onload = (e) => {
            canvas.current = document.createElement('canvas')
            canvas.current.width = img.naturalWidth;
            canvas.current.height= img.naturalHeight;
            let ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D
            ctx.drawImage(img,0,0)
            let defaultSettings = calculateDisplaySettings( img, mDiv.current as HTMLDivElement)
            dispatch(setDisplay(defaultSettings))
            setLoading(false)
        }
        img.src= imagePath
    },[imagePath])

    return (
        <div ref={mDiv} className={classes.mainDiv}>
            {
                isloading ?
                    <></> :
                <EventRouter>
                    <Viewport image={canvas.current!}/>
                </EventRouter>
            }
        </div>
    )

}

function calculateDisplaySettings( image : HTMLImageElement, container : HTMLDivElement) : string {
    let iW = image.naturalWidth
    let iH = image.naturalHeight
    let cW = container.clientWidth
    let cH = container.clientHeight
    let wScale = cW/iW 
    let hScale = cH/iH 
    let scale = Math.min(wScale, hScale)
    let dW = Math.round(iW*scale)
    let dH = Math.round(iH*scale)
    let dx = (cW-dW)/2
    let dy = (cH-dH)/2

    let mat = new DOMMatrix()
    mat.translateSelf(dx, dy, 0)
    mat.scaleSelf(scale, scale, 1, 0, 0, 0)

    return mat.toString()
}