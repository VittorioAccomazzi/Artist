import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32, ImageFactory} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'

const numSteps = 20
const sSlope = 1.0
const eSlope = 1.6
const offset = 0.6

export default class Painter {

    private hImage : ImageFloat32 | null = null
    private sImage : ImageFloat32 | null = null
    private vImage : ImageFloat32 | null = null
    private step : number =0


    constructor( inCanvas : SeqCanvas ){
        [this.hImage, this.sImage, this.vImage] = CanvasUtil.toHSV(inCanvas)
    }

    next() : SeqCanvas | null {
        let outCanvas = null
        if (this.step < numSteps) {
            this.step ++
            let weight = this.step/numSteps
            let slope  = (1-weight) * sSlope + weight * eSlope
            let width = this.vImage!.width
            let height= this.vImage!.height
            let vImage = ImageFactory.Float32(width,height)
            let sImage = ImageFactory.Float32(width,height)
            let viPixels = this.vImage!.imagePixels
            let voPixels= vImage.imagePixels
            viPixels.forEach((v,i)=>voPixels[i]=Math.max(0,Math.min(1,(v-offset)*slope+offset)))
            let siPixels = this.sImage!.imagePixels
            let soPixels= sImage.imagePixels
            siPixels.forEach((v,i)=>soPixels[i]=Math.max(0,Math.min(1,(v-offset)*slope+offset)))
            outCanvas = CanvasUtil.fromHSV(this.hImage!, sImage, vImage)
        }
        return outCanvas
    }

}
