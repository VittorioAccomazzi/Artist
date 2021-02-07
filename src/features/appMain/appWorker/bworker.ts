import {SeqCanvas} from '../../../imglib/canvasUtils'
import Painter from './painter'
export type BackWorkerClassConstructors = { new (inCanvas : SeqCanvas): BackWorker }

/**
 * background worker class. This class is designed to work on the background 
 * worker, and as such doesn't have access to the DOM elements.
 */
export default class BackWorker {

    private worker : Painter | null = null

    constructor( inCanvas : SeqCanvas ){
        this.worker = new Painter(inCanvas)
    }

    async next() {
        let image = null
        if( this.worker ) image = this.worker.next()
        return image
    }

    async stop(){
        this.worker = null
    }

}