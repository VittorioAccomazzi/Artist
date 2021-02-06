import {SeqCanvas} from '../../../imglib/canvasUtils'

export type BackWorkerClassConstructors = { new (inCanvas : SeqCanvas): BackWorker }

/**
 * background worker class. This class is designed to work on the background 
 * worker, and as such doesn't have access to the DOM elements.
 */
export default class BackWorker {

    private canvas : SeqCanvas | null = null

    constructor( inCanvas : SeqCanvas ){
        this.canvas = inCanvas
    }

    async next() {
        let canvas = this.canvas
        if( this.canvas ){
            this.fade()
            canvas = this.canvas
            if ( this.canvas!.data.every((v)=>v===0) ){
                // we are done, is all blank
                this.canvas = null
            }
        }
        return canvas
    }

    async stop(){
        this.canvas = null
    }

    private fade() {
        this.canvas!.data.forEach((v,i)=>v > 0 ? this.canvas!.data[i]=v-1 : 0 )
    }

}