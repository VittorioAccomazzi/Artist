import React, {useState, useEffect,useRef} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import PanZoom from './PanZoom'
import ForeWorker from './appWorker/fworker'

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
    let mDiv   = useRef<HTMLDivElement|null>(null) 
    let worker = useRef<ForeWorker|null>(null)
    const classes  = useStyles();


    useEffect(()=>{
        if( imagePath === null ) return;
        setLoading(true)
        let img = document.createElement('img') as HTMLImageElement
        img.onload = (e) => {
            const startWorker = () =>{
                if( canvas.current){
                    worker.current = new ForeWorker(img, canvas.current)
                    worker.current.start()
                    setLoading(false)
                } else {
                    console.error(`canvas null when image received. THIS SHOULD NOT HAPPEN`)
                }
                
            }
            if( worker.current != null )  worker.current.stop().then(startWorker)
            else startWorker()
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
