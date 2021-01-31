import {hash, getCanvases, toHTMLCanvas, toNodeCanvas, dumpImage, dumpCanvas} from './testutils'
import CanvasUtils from './canvasUtils'
import { createCanvas } from 'canvas'
import { ImageUint8 } from './imagebase'

test('shall split and combine canvas in images',async ()=>{
    for await ( const [canvas1,] of getCanvases() ) {
        let hsh1 = await hash(canvas1)
        const [ r, g, b, a ] = CanvasUtils.toRGB( toHTMLCanvas(canvas1))
        let canvas2 = toNodeCanvas(CanvasUtils.fromRGB(r,g,b,a))
        let hsh2 = await hash(canvas2)
        expect(hsh1).toBe(hsh2)
        let canvas3 = toNodeCanvas(CanvasUtils.fromRGB(r,g,b))
        let hsh3 = await hash(canvas3)
        expect(hsh1).toBe(hsh3)
    }
})

test('shall convert to gray scale',async ()=>{
    for await ( const [canvas,] of getCanvases() ) {
        let int = CanvasUtils.toGrayScale(toHTMLCanvas(canvas))
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
    dumpCanvas(canvas,'test')
    const [hImg, sImg, vImg] = CanvasUtils.toHSV(toHTMLCanvas(canvas))

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
        const [hImg, sImg, vImg ] = CanvasUtils.toHSV(toHTMLCanvas(canvas))
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
        await dumpImage(h8bit,`hue-${name}`)
        await dumpImage(s8bit,`sat-${name}`)
        await dumpImage(v8bit,`val-${name}`)
    }
})

test('shall compose the image from hsv',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        // decompose
        const [hImg, sImg, vImg ] = CanvasUtils.toHSV(toHTMLCanvas(canvas))
        const [rImg, gImg, bImg ] = CanvasUtils.toRGB(toHTMLCanvas(canvas))

        //recompose
        const hCanvas = CanvasUtils.fromHSV(hImg, sImg, vImg)

        // validate
        const [rImg1, gImg1, bImg1] = CanvasUtils.toRGB(hCanvas)

        expect(Error(rImg,rImg1)).toBeLessThan(1)
        expect(Error(gImg,gImg1)).toBeLessThan(1)
        expect(Error(bImg,bImg1)).toBeLessThan(1)
    }
})

function Error( aImg : ImageUint8, bImg : ImageUint8 ) :  number {
    let aPixels = aImg.imagePixels
    let bPixels = bImg.imagePixels
    let err = 0
    aPixels.forEach((v,i)=>err=Math.max(err, Math.abs(v-bPixels[i])))
    return err
}