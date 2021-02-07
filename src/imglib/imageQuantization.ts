import Histogram from './histogram'
import {ImageUint16, ImageUint8} from './imagebase'
import MedianFilter from './medianFilter'

export default class ImageQuantization {

    static Run( image : ImageUint16 | ImageUint8, hKernelSize :  number =1 ){
        let hist = new Histogram(image)
        hist = MedianFilter.Run(hist,5)
        let map = this.mapToMaxima(hist.histogramBins, hKernelSize)
        let pixels = image.imagePixels
        pixels.forEach((val:number, index:number)=>pixels[index]=map[val])
    }

    private static mapToMaxima( bins : number [], hSize : number  ) : number [] {
        let maximas : number [] = []
        bins.forEach((val,index)=>{
            let isMax = true
            for(let i=index-hSize; i<=index+hSize; i++){
                if( i >=0 && i< bins.length ) isMax = isMax && (val >= bins[i])
            }
            if(isMax) maximas.push(index)
        })
        let remap = bins.map((val, index)=>{
            // find the closest maxima
            let diff = maximas.map((v)=>Math.abs(index-v))
            let minIndex = diff.reduce((minI, val, idx)=> val < diff[minI]? idx : minI, 0)
            return maximas[minIndex]
        })
        return remap
    }

}