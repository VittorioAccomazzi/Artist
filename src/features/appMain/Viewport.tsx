import React, {useState, useLayoutEffect, useRef} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from "react-redux";
import { selectTimestamp} from '../../app/imageSlice'
import { selectDisplay} from '../../app/displaySlice'


const useStyles = makeStyles((theme) => ({
canvas: {
        width:'100%',
        height:'100%'
    },
}))

type  CanvasSize = {
    width: number,
    height: number
}

const defaultSize : CanvasSize= {
    width:10,
    height:10
}

export type ViewportInfo = {
    image : HTMLCanvasElement
}

export default function Viewport({image} :  ViewportInfo) {
    const displaySettings = useSelector(selectDisplay);
    const classes = useStyles();
    let canvas = useRef<HTMLCanvasElement> (null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const timestamp = useSelector(selectTimestamp)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    const [size,setSize] = useState<CanvasSize>(defaultSize)

    // resize
    useLayoutEffect(()=>{
        const updateSize=() =>{
            if(canvas.current){
                setSize({width:canvas.current.width, height:canvas.current.height})
            }
        }
        window.addEventListener('resize', updateSize);
        updateSize(); // update the size, now.
        return () => window.removeEventListener('resize',updateSize);
    },[]);

    // render object. This is invoked every time.
    if( canvas.current)  drawCanvas( canvas.current, image, displaySettings)

    return (
        <canvas className={classes.canvas} ref={canvas}></canvas>
    )
}

function drawCanvas( canvas : HTMLCanvasElement, image : HTMLCanvasElement, displaySettings : string) : void {
    canvas.width = canvas.clientWidth;
    canvas.height= canvas.clientHeight;
    let mat = new DOMMatrix(displaySettings)
    let ctx = canvas.getContext('2d')
    if( ctx ){
        ctx.resetTransform()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.setTransform(mat)
        ctx.drawImage(image,0,0);
    }
}