import {SeqCanvas} from '../../../imglib/canvasUtils'
import {ImageFloat32} from '../../../imglib/imagebase'
import CanvasUtil from '../../../imglib/canvasUtils'
import TensorSmoothing from '../../../imglib/tensorSmoothing'
import TensorGenerator from '../../../imglib/tensorGenerator'
import TensorShock from '../../../imglib/tensorShock'
import Painter from './painter'

const numSteps = 6
const tRelax = {nIterations:2, tau : 20000} // doesn't have a real impact

export default class TensorPainter extends Painter {

    constructor( inCanvas : SeqCanvas ){
        super(inCanvas, numSteps)
    }

    protected generate(step: number ) : SeqCanvas {
        [this.lImage, this.aImage, this.bImage] = TensorSmoothing.Run(this.lImage, this.aImage, this.bImage,1.5,tRelax) as [ ImageFloat32, ImageFloat32, ImageFloat32]
        let tf = TensorGenerator.Run(this.lImage, this.aImage, this.bImage, 1,tRelax)
        this.lImage = TensorShock.Run(this.lImage, tf, 1.5, 5, 1) as ImageFloat32
        return CanvasUtil.fromLab(this.lImage, this.aImage, this.bImage)
    }

}
