import {ImageFactory, ImageUint16} from './imagebase'
import Histogram from './histogram'
import MedianFilter from './medianFilter'
import { displayHisto, getCanvases, hash, dumpCanvas, toSeqCanvas } from './testutils'
import CanvasUtils from './canvasUtils'

test('shall implement median filter',async ()=>{
    let width = 16
    let height= 16
    let image = ImageFactory.Uint16(width, height)
    let pixels= image.imagePixels
    pixels.forEach((v,i)=>pixels[i]=i)
    let hist = new Histogram(image) 
    expect(hist.maxValue).toBe(1) // histogram flat with max value 1
    pixels[0]=10
    hist = new Histogram(image) 
    expect(hist.maxValue).toBe(2)
    expect(hist.histogramBins[10]).toBe(2)

    let med1 = MedianFilter.Run( hist, 1 )
    expect(med1.histogramBins[10]).toBe(1)

    let med2 = MedianFilter.Run( hist, 2 )
    expect(med2.histogramBins[10]).toBe(1)
})

test('shall smooth the histogram values',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [hImg] = CanvasUtils.toHSV(toSeqCanvas(canvas))
        let hImg16 = hImg.convertTo('Uint16') // will truncate the values
        let uHist = new Histogram(hImg16 as ImageUint16)
        
        let uImage = displayHisto(uHist)
        // await dumpCanvas(uImage, `hist-${name}-unfiltered`)
        let hashU = await hash(uImage)
        expect(hashU).toMatchSnapshot()

        let fHist = MedianFilter.Run(uHist,5)
        let fImage= displayHisto(fHist)
        // await dumpCanvas(fImage, `hist-${name}-filtered`)
        let hashF = await hash(fImage)
        expect(hashF).toMatchSnapshot()

    }
})