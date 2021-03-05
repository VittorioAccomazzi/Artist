import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'

export default abstract class Painter {

    protected lImage : ImageFloat32  
    protected aImage : ImageFloat32 
    protected bImage : ImageFloat32 
    private currStep : number =0
    private numSteps : number =0

    constructor( inCanvas : SeqCanvas, numSteps : number  ){
        [this.lImage, this.aImage, this.bImage] = CanvasUtil.toLab(inCanvas)
        this.numSteps = numSteps
    }

    public get Persentage() : number {
        return this.currStep/this.numSteps
    }

    public nextImage() : SeqCanvas | null {
        let outCanvas = null
        if( this.currStep<this.numSteps){
            outCanvas = this.generate(this.currStep)
            this.currStep++
        }
        
        return outCanvas
    }

    protected abstract generate( step : number ) : SeqCanvas;

}
