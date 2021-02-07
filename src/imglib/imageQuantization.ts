import Histogram from './histogram'
import {ImageUint16, ImageUint8} from './imagebase'
import MedianFilter from './medianFilter'

const noValue = -1 

export default class ImageQuantization {

    /**
     * Simple quantization method looking at the peak in the histogram.
     * @param image input image. It will be quantized *in place*
     * @param hKernelMax half of the kernel size for detering the maxium. Larger the number more quantized is the image
     * @param hKenerlMedian half of the median lernel applied to the histogram for smoothing.
     */
    static Run( image : ImageUint16 | ImageUint8, hKernelMax :  number =1, hKenerlMedian : number  =5 ){
        let oHist = new Histogram(image)
        let fHist = MedianFilter.Run(oHist,hKenerlMedian)
        let map = this.mapToMaxima(oHist, fHist, hKernelMax)
        let pixels = image.imagePixels
        pixels.forEach((val:number, index:number)=>pixels[index]=map[val])
    }

    private static mapToMaxima( oHist : Histogram, fHist : Histogram, hSize : number  ) : number [] { 
        let bins = fHist.histogramBins
        let maximas : number [] =   ImageQuantization.findMaxima(bins, hSize)
        let remap : number [] = Array(oHist.histogramBins.length).fill(noValue)

        // for each maxima find the cluster
        maximas.forEach(v=>{
            if( remap[v] === noValue ){
                const [ start, end ] = this.findCluster(fHist.histogramBins, v) // clster start and end (inclusive)
                let avg = this.avgCluster( fHist.histogramBins, start, end)     // find average value
                for( let i=start; i<=end; i++) remap[i] = avg                   // set in remappinng table
            }
        })

        // now deal the isolate values which have been zeroed by the filtering
        oHist.histogramBins.forEach((v,index)=>{
            if( v >0 && remap[index] === noValue ){
                remap[index]=ImageQuantization.findNearest(remap, index)
            }
        })
        return remap
    }

    private static findNearest(remap : number [], index : number ) : number {
        let start = index
        let end = index

        while( start >=0 && remap[start] === noValue ) start--
        while( end < remap.length && remap[end] === noValue ) end++

        let startDst = start >= 0 ? index-start : remap.length
        let endDst   = end < remap.length ? end-index : remap.length

        return startDst < endDst ? start : end
    }

    private static avgCluster( bins :  number [], start : number, end : number ) : number {
        let sum = 0
        let weight = 0
        for( let i=start; i<=end; i++){
            sum += bins[i]
            weight += i*bins[i]
        }
        return Math.floor(weight/sum)
    }

    private static findCluster( bins : number [], index : number ) : [number, number] {

        let start = index-1
        let end   = index+1

        while( start >0 && bins[start] <= bins[start+1]) start--;
        if( start >=0 && bins[start] > bins[start+1] ) start++

        while( end < bins.length-1 && bins[end] <= bins[end-1]) end++;
        if( end < bins.length && bins[end] > bins[end-1]) end--

        return [ Math.max(0,start), Math.min( bins.length-1, end ) ]
    }

    private static findMaxima(bins: number[], hSize: number) {
        let maximas: number[] = []
        bins.forEach((val, index) => {
            let isMax = true
            for (let i = index - hSize; i <= index + hSize; i++) {
                if (i >= 0 && i < bins.length)
                    isMax = isMax && (val >= bins[i])
            }
            if (isMax && val > 0)
                maximas.push(index)
        })
        return maximas
    }
}