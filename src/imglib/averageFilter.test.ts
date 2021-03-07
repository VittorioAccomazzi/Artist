import AverageFilter from './averageFilter'
import Histogram from './histogram'

test('shall average the histogram',()=>{
    let bins = [1, 3, 5, 2, 8, 2, 1]
    let orgHist = new Histogram(bins)
    let avgHist = AverageFilter.Run(orgHist,1)

    expect(avgHist.histogramBins).toStrictEqual([2, 3, 3, 5, 4, 3, 1])
})