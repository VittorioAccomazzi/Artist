import React, {useState, useEffect,useRef} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import PanZoom from './PanZoom'

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
    const classes  = useStyles();

    useEffect(()=>{

        const addLline = ()=>{
            if( canvas.current != null ){
                let ctx = canvas.current.getContext('2d')
                if( ctx ){
                    let width = canvas.current.width
                    let height= canvas.current.height
                    ctx.strokeStyle ="#FF0000"
                    ctx.beginPath()
                    ctx.moveTo(width*Math.random(),height*Math.random())
                    ctx.lineTo(width*Math.random(),height*Math.random())
                    ctx.stroke()
                }
            }
        }
        let int = window.setInterval(addLline,500)
        return ()=>{ window.clearInterval(int)}
    },[])

    useEffect(()=>{
        if( imagePath === null ) return;
        setLoading(true)
        let img = document.createElement('img') as HTMLImageElement
        img.onload = (e) => {
            if( canvas.current != null ){
                canvas.current.width = img.naturalWidth;
                canvas.current.height= img.naturalHeight;
                let ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D
                ctx.drawImage(img,0,0)
                setLoading(false)
            } else {
                console.error(`canvas null when image received. THIS SHOULD NOT HAPPEN`)
            }
        }
        img.src= imagePath
    },[imagePath,canvas])

    return (
        <div ref={mDiv} className={classes.mainDiv}>
            {
                <PanZoom filename={imagePath}>
                    <canvas ref={canvas}/>
                </PanZoom>
            }
        </div>
    )
}
