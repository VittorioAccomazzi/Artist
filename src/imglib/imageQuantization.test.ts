import {ImageFactory } from './imagebase'
import GaussianFilter from './gaussianFilter'
import ImageQuantization from './imageQuantization'
import { dumpImage } from './testutils'
import Histogram from './histogram'
import {hash} from './testutils'

test('Quantize colour based on histogram peak', async ()=>{
    let kernelSize = 5
    let dark = 100
    let brght= 128
    let width = 256
    let height= 312
    let image = ImageFactory.Uint8(width,height)
    let size = 80
    let xStart = Math.ceil((width-size)/2)
    let yStart = Math.ceil((height-size)/2)
    image.imagePixels.forEach((v,i)=>image.imagePixels[i]=dark) // background values
    for( let y=0; y<size; y++){
        for( let x=0; x<size; x++ ){
            image.set(xStart+x, yStart+y, brght)
        }
    }

    GaussianFilter.Run(image, kernelSize)  
    //await dumpImage(image,`Gaussian image`) 


    let histo = new Histogram(image)
    let uNum = histo.histogramBins.reduce((sum,v)=>sum+(v>0 ? 1:0),0) // non zero entries
    let uhash= await hash(image)
    expect(uhash).toMatchSnapshot()


    // quantize the image
    ImageQuantization.Run(image, Math.floor((brght-dark) * 0.3))
    //await dumpImage(image,`Gaussian image Quantized`) 
    histo = new Histogram(image)
    let qNum = histo.histogramBins.reduce((sum,v)=>sum+(v>0 ? 1:0),0) // non zero entries
    let qhash= await hash(image)
    expect(qhash).toMatchSnapshot()
    expect(qhash).not.toBe(uhash)

    // make sure that we reduced the spread on the histogram
    expect(qNum).toBeLessThan(uNum)
})