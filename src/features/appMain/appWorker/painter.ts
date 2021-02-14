import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32, ImageFactory, ImageUint8} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'
import ImageQuantization from '../../../imglib/imageQuantization'
import {ImageUint16} from '../../../imglib/imagebase'
import Histogram from '../../../imglib/histogram'
import GaussianFilter from '../../../imglib/gaussianFilter'
import CannyEdgeDetection from '../../../imglib/cannyED'
import BilateralFilter from '../../../imglib/bilateralFilter'

const numSteps = 5
const scaleStd = 3
const rangeStd = 5

export default class Painter {

    private lImage : ImageFloat32 | null = null
    private aImage : ImageFloat32 | null = null
    private bImage : ImageFloat32 | null = null
    private dImage : ImageUint8 | null = null
    private step : number =0

    constructor( inCanvas : SeqCanvas ){
        [this.lImage, this.aImage, this.bImage] = CanvasUtil.toLab(inCanvas)
    }

    next() : SeqCanvas | null {
        let outCanvas = null

        if( this.step < numSteps) {
            [this.lImage, this.aImage, this.bImage] = BilateralFilter.Run(this.lImage!, this.aImage!, this.bImage!, scaleStd, rangeStd) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            outCanvas = CanvasUtil.fromLab(this.lImage, this.aImage, this.bImage)
        } else  if ( this.dImage == null ){
            outCanvas = CanvasUtil.fromLab(this.lImage!, this.aImage!, this.bImage!)
            this.lineDrawing()
            this.overlayImage(this.dImage!, outCanvas)
        }

        this.step++
        return outCanvas
    }

    private lineDrawing() : void {

        let image = this.lImage!.convertTo('Float32') as ImageFloat32
        //GaussianFilter.Run(image,2.0) // filter in place
        this.dImage = CannyEdgeDetection.Detect(image, 0.96, 0.99) // extact edges

        // invert the image
        let pixels = this.dImage.imagePixels
        pixels.forEach((v,i)=>pixels[i]=255-v)
    }


    private overlayImage(inFront : ImageUint8, inBack : SeqCanvas ) : void {
        let nPixels = inFront.width * inFront.height
        let ptr=0
        for( let p=0; p<nPixels; p++ ){
            if( inFront.imagePixels[p] === 0 ){
                inBack.data[ptr++] = 10 // settting a dark gray
                inBack.data[ptr++] = 8
                inBack.data[ptr++] = 12
            } else {
                ptr += 3
            }
        }
    }

}
