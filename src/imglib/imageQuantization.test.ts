import {ImageFactory, ImageFloat32, ImageUint16, ImageUint8 } from './imagebase'
import GaussianFilter from './gaussianFilter'
import ImageQuantization from './imageQuantization'
import { displayHisto, dumpCanvas, dumpImage, getCanvases, toSeqCanvas, hash } from './testutils'
import Histogram from './histogram'
import CanvasUtils from './canvasUtils'
import MedianFilter from './medianFilter'

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
    ImageQuantization.Run(image)
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
    ImageQuantization.Run(image, 5)

    let pixels = image.imagePixels
    pixels.forEach((v,i)=>pixels[i]=100)

    ImageQuantization.Run(image, 5)

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

    ImageQuantization.Run(image1, 1 )
    //await dumpImage(image1, `Quantized image`)
    let hash1 = await hash(image1)
    expect(hash1).toMatchSnapshot()

    ImageQuantization.Run(image2, 0 )
    //await dumpImage(image2, `Quantized image no filter`)
    let hash2 = await hash(image2)
    expect(hash2).toMatchSnapshot()

})

test('shall quantize properly real images',async()=>{
    const medianKernerl = 5
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [hImg,sImg,vImg] = CanvasUtils.toHSV(toSeqCanvas(canvas))

        let [ hHist ] = clusterHistos(hImg, medianKernerl)
        //await dumpCanvas( hHist, `H Hist ${name}`)
        let hhash = await hash(hHist)
        expect(hhash).toMatchSnapshot()

        let [ sHist ] = clusterHistos(sImg, medianKernerl)
        //await dumpCanvas( sHist, `S Hist ${name}`)
        let shash = await hash(sHist)
        expect(shash).toMatchSnapshot()

        let [ vHist ] = clusterHistos(vImg, medianKernerl)
        //await dumpCanvas( vHist, `V Hist ${name}`)
        let vhash = await hash(vHist)
        expect(vhash).toMatchSnapshot()

    }
},60*60*1000)


test('shall identify all the histogram peaks and deal with outliers',async ()=>{

    let width = 256
    let height= 256
    let image = ImageFactory.Uint8(width,height)

    addElements( 0, 0, 32, 128, image)
    addElements( 32, 128, 64, 0 , image)
    addElements( 140, 0, 141, 255, image)
    addElements( 250, 0, 251, 255, image)

    ImageQuantization.Run(image,  3 )
    //await dumpImage(image, `Quantized image with outlier`)
    let hash2 = await hash(image)
    expect(hash2).toMatchSnapshot()
})

function clusterHistos(inImage: ImageFloat32, medianKernerl: number) {
    let imgMax = inImage.maxValue()
    let trgMax = Math.max(256,imgMax)
    let orgImg16 = inImage.convertTo('Uint16', trgMax/imgMax, 0) as ImageUint16
    let orgHist = new Histogram(orgImg16)
    let fltHist = MedianFilter.Run(orgHist, medianKernerl)

    let qtzImg16 = orgImg16.convertTo('Uint16') as ImageUint16
    ImageQuantization.Run(qtzImg16, medianKernerl)
    let qtzHist = new Histogram(qtzImg16)
    let cMap: string[] = Array(qtzHist.histogramBins.length).fill("#000000")
    let colors = ["#FF0000", "#00FF00", "#0000FF"]
    let c = 0
    qtzHist.histogramBins.forEach((v, index) => {
        if (v > 0) {
            cMap[index] = colors[c % colors.length]
            c++
        }
    })

    // colormap to display histogram
    let histCmap: string[] = Array(orgHist.histogramBins.length).fill("#000000")

    let orgPixels = orgImg16.imagePixels
    let qtxPixels = qtzImg16.imagePixels

    orgPixels.forEach((v, index) => {
        let qtz = qtxPixels[index]
        let col = cMap[qtz]
        histCmap[v] = col
    })

    let orgHistD = displayHisto(orgHist, histCmap)
    let fltHistD = displayHisto(fltHist, histCmap)
    return [ orgHistD, fltHistD ]
}

function addElements( xS : number, yS : number, xE : number, yE: number, image : ImageUint8){
    for( let x=xS; x<=xE; x++ ){
        let slope = (yE-yS)/(xE-xS)
        let y = Math.floor(( x-xS ) * slope + yS)
        for( let i=0; i<y; i++){
            image.set(x,image.height-1-i,x )
        }
    }
}