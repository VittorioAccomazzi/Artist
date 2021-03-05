import {SeqCanvas} from '../../../imglib/canvasUtils'
import BilateralPainter from './bilateralPainter'
import Painter from './painter'
import { PainterType } from './painterSlice'
import TensorPainter from './tensorPainter'
export type BackWorkerClassConstructors = { new (inCanvas : SeqCanvas, type : PainterType): BackWorker }

/**
 * background worker class. This class is designed to work on the background 
 * worker, and as such doesn't have access to the DOM elements.
 */
export default class BackWorker {

    private worker : Painter | null = null

    constructor( inCanvas : SeqCanvas, type : PainterType ){
        switch( type ){
            case PainterType.Bilateral :
                this.worker = new BilateralPainter(inCanvas)
                break;
            case PainterType.Tensor :
                this.worker = new TensorPainter(inCanvas)
                break;
        }
    }

    async next() {
        let image = null
        if( this.worker ) image = this.worker.nextImage()
        return image
    }

    async stop(){
        this.worker = null
    }

}