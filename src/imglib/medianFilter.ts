import Histogram from './histogram'

export default class MedianFilter {

    /**
     * Applies median filter to input histogram
     * @param inHisto input histogram
     * @param sigma half kernel size
     */
    static Run(inHisto : Histogram, sigma : number) : Histogram {
        sigma = Math.max( 1, Math.floor(sigma))
        let inBin = inHisto.histogramBins
        let ouBin = inBin.map((val, index)=>{
            let values = []
            for( let i=index -sigma; i<=index + sigma; i++ ){
                let j = i
                if( j < 0 ) j+= inBin.length // wrap around.
                if( j > inBin.length-1 ) j -= inBin.length // wrap around
                values.push(inBin[j])
            }
            values.sort((a,b)=>a-b)
            return values[sigma]
        })
        return new Histogram(ouBin)
    }
}