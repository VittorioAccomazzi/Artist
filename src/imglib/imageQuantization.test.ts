import {ImageFactory, ImageUint8 } from './imagebase'
import GaussianFilter from './gaussianFilter'
import ImageQuantization from './imageQuantization'
import { displayHisto, dumpCanvas, dumpImage } from './testutils'
import Histogram from './histogram'
import {hash} from './testutils'
import { IncomingMessage } from 'http'

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

test('shall not throw', ()=>{

    let width = 256
    let height= 256
    let image = ImageFactory.Uint8(width,height)
    ImageQuantization.Run(image, 5, 5)

    let pixels = image.imagePixels
    pixels.forEach((v,i)=>pixels[i]=100)

    ImageQuantization.Run(image, 5, 5)
    
})

test('shall identify all the histogram peaks',async ()=>{

    let width = 256
    let height= 256
    let image = ImageFactory.Uint8(width,height)

    addElements( 0, 0, 32, 128, image)
    addElements( 32, 128, 64, 0 , image)
    addElements( 64, 0, 128, 255, image)
    addElements( 128, 255, 255, 0, image)

    let image1 = image.convertTo('Uint8') as ImageUint8
    let image2 = image.convertTo('Uint8') as ImageUint8

    ImageQuantization.Run(image1, 3, 1 )
    //dumpImage(image1, `Quantized image`)
    let hash1 = await hash(image1)
    expect(hash1).toMatchSnapshot()

    ImageQuantization.Run(image2, 1, 0 )
    //dumpImage(image2, `Quantized image no filter`)
    let hash2 = await hash(image2)
    expect(hash2).toMatchSnapshot()

})

test('shall identify all the histogram peaks and deal with outliers',async ()=>{

    let width = 256
    let height= 256
    let image = ImageFactory.Uint8(width,height)

    addElements( 0, 0, 32, 128, image)
    addElements( 32, 128, 64, 0 , image)
    addElements( 140, 0, 141, 255, image)
    addElements( 250, 0, 251, 255, image)

    ImageQuantization.Run(image, 3, 3 )
    //dumpImage(image, `Quantized image with outlier`)
    let hash2 = await hash(image)
    expect(hash2).toMatchSnapshot()
})

function addElements( xS : number, yS : number, xE : number, yE: number, image : ImageUint8){
    for( let x=xS; x<=xE; x++ ){
        let slope = (yE-yS)/(xE-xS)
        let y = Math.floor(( x-xS ) * slope + yS)
        for( let i=0; i<y; i++){
            image.set(x,image.height-1-i,x )
        }
    }
}