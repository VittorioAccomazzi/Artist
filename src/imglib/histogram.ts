import {ImageFactory, Image2D, ImageFloat32, ImageUint16, ImageUint8} from './imagebase'

export default class Histogram {
    private bins : number[]
    private sum : number =0

    constructor( inImage : ImageUint16 | ImageUint8) {
        let max = inImage.maxValue()
        let pixels = inImage.imagePixels;
        this.sum = pixels.length // number of bins in the histogram.
        this.bins = Array(max+1).fill(0)
        pixels.forEach((v:number)=>this.bins[v]++)
    }

    /**
     * returns the histogram bins
     */
    get histogramBins() {
        return this.bins;
    }

    /**
     * max histtogram value
     */
    get maxValue(){
        return this.bins.reduce((m,v)=>Math.max(m,v),0)
    }

    /**
     * 
     * @param val persentage of the histogram
     */
    threshold(val : number ) : number {
        if( val < 0 || val > 1 ) throw Error(`invalid histogram threshold ${val}. It shall be between 0 and 1`)
        let target = this.sum * val;
        let s = 0 
        let i = 0
        while ( s < target && i<this.bins.length) {
            s+= this.bins[i]
            i++
        }
        return i;
    }
}