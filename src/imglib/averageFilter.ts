import Histogram from './histogram'

export default class AverageFilter {

    /**
     * filter in place the histogram with a moving average.
     * @param inHist input histogram
     * @param kSize filter size
     */
    static Run(inHist : Histogram, kSize : number)  {
        let fBins = inHist.histogramBins
        if( kSize > 0 ){
            let inBins = inHist.histogramBins
            let ouBins : number [] = Array(inBins.length).fill(0)
            ouBins.filter((v,index)=>{
                let sum = 0
                let count= 0
                for(let i=index-kSize; i<= index+kSize; i++){
                    if( i>=0 && i<inBins.length){
                        count++
                        sum += inBins[i]
                    }
                }
                ouBins[index]=Math.floor(sum/count)
            })
            fBins = ouBins
        }

        return new Histogram(fBins)
    }
}