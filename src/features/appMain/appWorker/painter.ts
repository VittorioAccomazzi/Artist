import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'
import BilateralFilter from '../../../imglib/bilateralFilter'
import DifferenceOfGaussian from '../../../imglib/dogFilter'
import IntensityQuantization from '../../../imglib/intensityQuantization'
import TensorFilter from '../../../imglib/tensorFilter'

const numSteps = 5
const scaleStd = 2
const rangeStd = 2
const scaleDog = 3

export default class Painter {

    private lImage : ImageFloat32 | null = null
    private aImage : ImageFloat32 | null = null
    private bImage : ImageFloat32 | null = null
    private dImage : ImageFloat32 | null = null
    private oImage : SeqCanvas
    private step : number =0

    constructor( inCanvas : SeqCanvas ){
        [this.lImage, this.aImage, this.bImage] = CanvasUtil.toLab(inCanvas)
        this.oImage = inCanvas
    }

    next() : SeqCanvas | null {
        let outCanvas = null

        if( this.step < numSteps) {
            [this.lImage, this.aImage, this.bImage] = TensorFilter.Run(this.lImage!, this.aImage!, this.bImage!,1) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            [this.lImage, this.aImage, this.bImage] = TensorFilter.Run(this.lImage!, this.aImage!, this.bImage!,1) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            [this.lImage, this.aImage, this.bImage] = BilateralFilter.Run(this.lImage!, this.aImage!, this.bImage!, scaleStd, rangeStd) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            outCanvas = CanvasUtil.fromLab(this.lImage, this.aImage, this.bImage)
        } else if ( this.step === numSteps ){
            this.luminosityQuantization()
            outCanvas = CanvasUtil.fromLab(this.lImage!, this.aImage!, this.bImage!)
        }

        if( this.step == scaleDog) this.generateDog()
        if( this.dImage != null && outCanvas != null ) this.overlayDog(outCanvas)

        this.step++
        return outCanvas
    }

    private luminosityQuantization(){
        let binSize=12
        let smoothenss = 1
        IntensityQuantization.Run(this.lImage!, binSize, smoothenss) 
    }

    private generateDog() {
        let sSigma = 1
        let lSigma = 1.6 * sSigma
        let sensitivity = 0.98
        let sharpness = 3
        this.dImage = DifferenceOfGaussian.Run( this.lImage!, sSigma, lSigma, sensitivity, sharpness)
    }

    private overlayDog( inCanvas : SeqCanvas) {
        let dogImage = this.dImage!
        let width = dogImage.width
        let height= dogImage.height
        let nPixels= width*height
        let dogPixels= dogImage.imagePixels
        let orgPixels= this.oImage.data
        let ptr=0
        for( let p=0; p<nPixels; p++ ){
            let weight = dogPixels[p]
            inCanvas.data[ptr] = weight * inCanvas.data[ptr]+(1-weight)*orgPixels[ptr++]
            inCanvas.data[ptr] = weight * inCanvas.data[ptr]+(1-weight)*orgPixels[ptr++]
            inCanvas.data[ptr] = weight * inCanvas.data[ptr]+(1-weight)*orgPixels[ptr++]
        }
    }

}
