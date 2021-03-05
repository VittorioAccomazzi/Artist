 /* eslint-disable import/no-webpack-loader-syntax */
import comlinkWorker from 'comlink-loader!./bworker.ts'
import BackWorker, {BackWorkerClassConstructors} from './bworker'
import CanvasUtil from '../../../imglib/canvasUtils'
import { PainterType } from './painterSlice'


const BackWorkerFactory = new comlinkWorker<BackWorkerClassConstructors>()
const targetSize = 1024
const timerSpeed = 300 // millisecond

/**
 * Foreground worker class. This class is designed to work  on the UI Javascript thread
 */
export default class ForeWorker {

    private canvas : HTMLCanvasElement | null = null
    private bworker : BackWorker | null = null
    private timer : number | null = null
    private type : PainterType

    constructor( image : HTMLImageElement, canvas : HTMLCanvasElement, type : PainterType ) {
        let imgWidth = image.naturalWidth
        let imgHeight= image.naturalHeight
        let wScale = targetSize/imgWidth
        let hScale = targetSize/imgHeight
        let scale  = Math.min(wScale, hScale)
        scale = Math.min( 1.0, scale ) // do not magnify the image
        let cnvWidth = Math.floor( imgWidth * scale )
        let cnvHeight= Math.floor( imgHeight * scale)
        canvas.width = cnvWidth
        canvas.height= cnvHeight;
        let ctx = canvas.getContext('2d') 
        if( ctx ){
            ctx.drawImage(image, 0, 0, imgWidth, imgHeight, 0, 0, cnvWidth, cnvHeight)
            this.canvas = canvas
        } else {
            console.error(`unable to obtain canvas context`)
        }
        this.type = type
    }

    async start(){

        const doWork = async () => {
            this.timer  = null
            if( this.canvas) {
                if( this.bworker == null  ){
                    // start
                    let seqCanvas = CanvasUtil.toSeq(this.canvas)
                    this.bworker  = await new BackWorkerFactory.default(seqCanvas, this.type)
                }
                const sCanvas= await this.bworker!.next() // do work !
                if( sCanvas ){
                    CanvasUtil.fromSeq(sCanvas, this.canvas)
                    this.timer  = window.setTimeout(doWork, timerSpeed) // continue the work
                }
                if( sCanvas == null) {
                    console.log('Done !!')
                }
            }
        }
        if( this.timer != null ) window.clearTimeout(this.timer)
        this.timer  = window.setTimeout(doWork, timerSpeed)
    } 

    async stop(){
        if( this.timer != null ) window.clearTimeout(this.timer)
        if( this.bworker != null ) await this.bworker.stop()
        this.canvas = null
        this.bworker= null
        this.timer  = null
    }

}
