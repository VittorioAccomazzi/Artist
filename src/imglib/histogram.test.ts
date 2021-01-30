import {ImageFactory} from './imagebase'
import Histogram from './histogram'

test('shall properly computte the bins',()=>{
    let width = 12
    let height= 13
    let image = ImageFactory.Uint8(width, height)
    let size = 5
    let xStart = Math.floor((width - size) / 2)
    let yStart = Math.floor((height - size) / 2)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            image.set(xStart + x, yStart + y, 1)
        }
    }
    let hist = new Histogram(image)

    expect(hist).not.toBeNull()
    expect(hist.histogramBins).not.toBeNull()

    expect(hist.histogramBins.reduce((s,v)=>s+v,0)).toBe(width*height)
    expect(hist.histogramBins[1]).toBe(25)
    expect(hist.histogramBins[0]).toBe(width*height-25)
})

test('shall properly compute the thresholds',()=>{
    let width = 12
    let height= 12
    let image = ImageFactory.Uint8(width, height)
    for( let y=0; y<height; y++ ){
        for(let x=0; x<width; x++){
            image.set(x,y,y)
        }
    }
    let hist = new Histogram(image)
    expect(hist.maxValue).toBe(12)
    expect(hist.threshold(0.5)).toBe(6)

})

test('shall support 8bit and 16 bit images',()=>{
    let width = 8
    let height= 8
    let image = ImageFactory.Uint16(width, height)
    image.set(3,2,4092)
    let hist = new Histogram(image)

    expect(hist.histogramBins[4092]).toBe(1)
    expect(hist.maxValue).toBe(width*height-1)

})


