import {hash, getCanvases, toSeqCanvas, toHTMLCanvas, toNodeCanvas, dumpImage, dumpCanvas} from './testutils'
import CanvasUtils from './canvasUtils'
import { createCanvas } from 'canvas'
import { ImageUint8 } from './imagebase'

test('shall split and combine canvas in images',async ()=>{
    for await ( const [canvas1,] of getCanvases() ) {
        let hsh1 = await hash(canvas1)
        const [ r, g, b ] = CanvasUtils.toRGB( toSeqCanvas(canvas1))
        let canvas2 = toNodeCanvas(CanvasUtils.fromRGB(r,g,b))
        let hsh2 = await hash(canvas2)
        expect(hsh1).toBe(hsh2)
    }
})

test('shall convert to gray scale',async ()=>{
    for await ( const [canvas,] of getCanvases() ) {
        let int = CanvasUtils.toGrayScale(toSeqCanvas(canvas))
        let hsh = await hash(int)
        expect(hsh).toMatchSnapshot()
    }
})

test('shall decompose in HSV-1',()=>{
    let width = 16
    let height= 16
    let canvas = createCanvas(width,height)
    let ctx = canvas.getContext('2d')
    ctx.fillStyle="#FFA0B0"
    ctx.fillRect(0,0,width/2,height/2)
    ctx.fillStyle="#00A0B0"
    ctx.fillRect(width/2,height/2,width/2,height/2)
    ctx.fillStyle="#A000B0"
    ctx.fillRect(0,height/2,width/2,height/2)
    ctx.fillStyle="#A0FF00"
    ctx.fillRect(width/2,0,width/2,height/2)
    //dumpCanvas(canvas,'test')
    const [hImg, sImg, vImg] = CanvasUtils.toHSV(toSeqCanvas(canvas))

    // using https://www.rapidtables.com/convert/color/rgb-to-hsv.html

    let x = 4
    let y = 4
    expect(hImg.get(x,y)).toBeCloseTo(350,0)
    expect(sImg.get(x,y)).toBeCloseTo(0.373,2)
    expect(vImg.get(x,y)).toBeCloseTo(1,2)

    x = 12
    y = 12
    expect(hImg.get(x,y)).toBeCloseTo(185,0)
    expect(sImg.get(x,y)).toBeCloseTo(1,2)
    expect(vImg.get(x,y)).toBeCloseTo(0.69,2)

    x = 4
    y = 12
    expect(hImg.get(x,y)).toBeCloseTo(295,0)
    expect(sImg.get(x,y)).toBeCloseTo(1,2)
    expect(vImg.get(x,y)).toBeCloseTo(0.69,2)

    x = 12
    y = 4
    expect(hImg.get(x,y)).toBeCloseTo(82,0)
    expect(sImg.get(x,y)).toBeCloseTo(1,2)
    expect(vImg.get(x,y)).toBeCloseTo(1,2)

})


test('shall decompose in HSV-2',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [hImg, sImg, vImg ] = CanvasUtils.toHSV(toSeqCanvas(canvas))
        expect(hImg.imageType==='Float32').toBeTruthy()
        expect(sImg.imageType==='Float32').toBeTruthy() 
        expect(vImg.imageType==='Float32').toBeTruthy() 
        let h8bit = hImg.convertTo('Uint8', 254/360,0)
        let s8bit = sImg.convertTo('Uint8', 254, 0)
        let v8bit = vImg.convertTo('Uint8', 254, 0)
        let hhsh = await hash(h8bit)
        let shsh = await hash(s8bit)
        let vhsh = await hash(v8bit)
        expect(hhsh).toMatchSnapshot()
        expect(shsh).toMatchSnapshot()
        expect(vhsh).toMatchSnapshot()
        //await dumpImage(h8bit,`hue-${name}`)
        //await dumpImage(s8bit,`sat-${name}`)
        //await dumpImage(v8bit,`val-${name}`)
    }
})

test('shall serialize canvas', async ()=>{
    for await ( const [nCanvas,ctx,name] of getCanvases() ) {
        // decompose
        let seq = CanvasUtils.toSeq(toHTMLCanvas(nCanvas))
        let hCanvas = document.createElement('canvas')
        CanvasUtils.fromSeq(seq,hCanvas)
        expect(nCanvas.width).toBe(hCanvas.width)
        expect(nCanvas.height).toBe(hCanvas.height)

        let nData = nCanvas.getContext('2d').getImageData(0, 0, nCanvas.width, nCanvas.height).data
        let hData = nCanvas.getContext('2d').getImageData(0, 0, nCanvas.width, nCanvas.height).data
        let diff  = nData.map((v,i)=>Math.abs(hData[i]-v))
        let allZero = diff.every((v)=>v==0)

        expect(allZero).toBe( true )
    }
})

test('shall compose the image from hsv',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        // decompose
        const [hImg, sImg, vImg ] = CanvasUtils.toHSV(toSeqCanvas(canvas))
        const [rImg, gImg, bImg ] = CanvasUtils.toRGB(toSeqCanvas(canvas))

        //recompose
        const hCanvas = CanvasUtils.fromHSV(hImg, sImg, vImg)

        // validate
        const [rImg1, gImg1, bImg1] = CanvasUtils.toRGB(hCanvas)

        expect(Error(rImg,rImg1)).toBeLessThan(2)
        expect(Error(gImg,gImg1)).toBeLessThan(2)
        expect(Error(bImg,bImg1)).toBeLessThan(2)
    }
})



test('shall decompose in LAB-1',()=>{
    let width = 16
    let height= 16
    let canvas = createCanvas(width,height)
    let ctx = canvas.getContext('2d')
    ctx.fillStyle="#FFA0B0"
    ctx.fillRect(0,0,width/2,height/2)
    ctx.fillStyle="#00A0B0"
    ctx.fillRect(width/2,height/2,width/2,height/2)
    ctx.fillStyle="#A000B0"
    ctx.fillRect(0,height/2,width/2,height/2)
    ctx.fillStyle="#A0FF00"
    ctx.fillRect(width/2,0,width/2,height/2)
    const [lImg, aImg, bImg] = CanvasUtils.toLab(toSeqCanvas(canvas))

    // using http://colormine.org/convert/rgb-to-lab

    let x = 4
    let y = 4
    expect(lImg.get(x,y)).toBeCloseTo(75.78,1)
    expect(aImg.get(x,y)).toBeCloseTo(37.18,1)
    expect(bImg.get(x,y)).toBeCloseTo(6.68,1)

    x = 12
    y = 12
    expect(lImg.get(x,y)).toBeCloseTo(60.13,1)
    expect(aImg.get(x,y)).toBeCloseTo(-28.77,1)
    expect(bImg.get(x,y)).toBeCloseTo(-18.20,1)

    x = 4
    y = 12
    expect(lImg.get(x,y)).toBeCloseTo(38.91,1)
    expect(aImg.get(x,y)).toBeCloseTo(71.84,1)
    expect(bImg.get(x,y)).toBeCloseTo(-50.84,1)

    x = 12
    y = 4
    expect(lImg.get(x,y)).toBeCloseTo(91.23,1)
    expect(aImg.get(x,y)).toBeCloseTo(-57.88,1)
    expect(bImg.get(x,y)).toBeCloseTo(87.42,1)

})

test('shall decompose in LAB-2',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
        expect(lImg.imageType==='Float32').toBeTruthy()
        expect(aImg.imageType==='Float32').toBeTruthy() 
        expect(bImg.imageType==='Float32').toBeTruthy() 
        let l8bit = lImg.convertTo('Uint8', 254/100, 0)
        let a8bit = aImg.convertTo('Uint8', 254/256, 128*254/256)
        let b8bit = bImg.convertTo('Uint8', 254/256, 128*254/256)
        let hhsh = await hash(l8bit)
        let shsh = await hash(a8bit)
        let vhsh = await hash(b8bit)
        expect(hhsh).toMatchSnapshot()
        expect(shsh).toMatchSnapshot()
        expect(vhsh).toMatchSnapshot()
        //await dumpImage(l8bit,`l-${name}`)
        //await dumpImage(a8bit,`a-${name}`)
        //await dumpImage(b8bit,`b-${name}`)
    }
})

test('shall compose the image from LAB',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        // decompose
        const [lImg, aImg, cImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
        const [rImg, gImg, bImg ] = CanvasUtils.toRGB(toSeqCanvas(canvas))

        //recompose
        const hCanvas = CanvasUtils.fromLab(lImg, aImg, cImg)

        // validate
        const [rImg1, gImg1, bImg1] = CanvasUtils.toRGB(hCanvas)

        expect(Error(rImg,rImg1)).toBeLessThan(2)
        expect(Error(gImg,gImg1)).toBeLessThan(2)
        expect(Error(bImg,bImg1)).toBeLessThan(2)
    }
})

function Error( aImg : ImageUint8, bImg : ImageUint8 ) :  number {
    let aPixels = aImg.imagePixels
    let bPixels = bImg.imagePixels
    let err = 0
    aPixels.forEach((v,i)=>err=Math.max(err, Math.abs(v-bPixels[i])))
    return err
}
