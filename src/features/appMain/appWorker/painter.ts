import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32, ImageFactory} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'
import ImageQuantization from '../../../imglib/imageQuantization'
import {ImageUint16} from '../../../imglib/imagebase'

const numSteps = 1

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

            let vStep = 6
            let sStep = 4

            let vImage = this.Quantize(this.vImage!, vStep )
            let sImage = this.Quantize(this.sImage!, sStep )

            outCanvas = CanvasUtil.fromHSV(this.hImage!, sImage!, vImage!)
        }
        return outCanvas
    }

    private  Quantize( inImage : ImageFloat32, hKenerlMedian : number ) : ImageFloat32 {
        let imgMax = inImage.maxValue()
        let trgMax = Math.max(256,imgMax)
        let image16 : ImageUint16 = inImage.convertTo('Uint16', trgMax/imgMax,0) as ImageUint16
        ImageQuantization.Run(image16, hKenerlMedian)
        return image16.convertTo('Float32', imgMax/trgMax,0) as ImageFloat32
    }

}
