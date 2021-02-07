
import {ImageUint16, ImageUint8, isImage} from './imagebase'

export default class Histogram {
    private bins : number[]
    private sum : number =0

    constructor( inBins : number []  )
    constructor( inImage : ImageUint16 | ImageUint8)
    constructor( inData : ImageUint16 | ImageUint8 | number []) {
        if( isImage( inData )){
            let max = inData.maxValue()
            let pixels = inData.imagePixels;
            this.sum = pixels.length // number of bins in the histogram.
            this.bins = Array(max+1).fill(0)
            pixels.forEach((v:number)=>this.bins[v]++)
        } else {
            this.bins = inData 
            this.sum = inData.reduce((sum, v)=>sum+v,0)
        }
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
     *  genetrate the threshold of histogram's intensity based on persetages
     * @param val persentage of the histogram
     */
    threshold(val : number ) : number {
        if( val < 0 || val > 1 ) throw Error(`invalid histogram threshold ${val}. It shall be between 0 and 1`)
        let target = this.sum * val;
        let s = this.bins[0]
        let i = 1
        while ( s < target && i<this.bins.length) {
            s+= this.bins[i]
            i++
        }
        return i-1;
    }
}

export function isHistogram( obj : any ) : obj is Histogram {
    return obj.bins != null && obj.sum > 0
}