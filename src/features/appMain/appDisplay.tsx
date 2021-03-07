import React, {useState, useEffect,useRef, useCallback} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import PanZoom from './PanZoom'
import ForeWorker from './appWorker/fworker'
import { useDispatch, useSelector } from 'react-redux';
import { selectPainter } from './appWorker/painterSlice';
import { selecDownload, setDownload } from './downloadSlice';
import { setProgress } from './progressSlice';

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
    const classes = useStyles();
    const painter = useSelector(selectPainter)
    const download= useSelector(selecDownload)
    const dispatch= useDispatch();

    // Downloader
    useEffect(()=>{
        if( canvas.current && download && worker.current ){
            // see https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
            let dImage = canvas.current.toDataURL('image/jpg').replace("image/png", "image/octet-stream"); 
            let link = document.createElement('a') 
            link.setAttribute('download', 'myImage.jpg')
            link.setAttribute('href', dImage)
            link.click()  
        }
        dispatch(setDownload(false))
    },[canvas, download, dispatch])


    // Image processor

    const progressCallback = useCallback((current : number, total : number) =>{
        dispatch(setProgress({current, total}))
    },[dispatch])


    useEffect(()=>{
        if( imagePath === null ) return;
        setLoading(true)
        let img = document.createElement('img') as HTMLImageElement
        img.onload = (e) => {
            const startWorker = () =>{
                if( canvas.current){
                    worker.current = new ForeWorker(img, canvas.current, painter, progressCallback)
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
    },[imagePath,canvas, painter])

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
