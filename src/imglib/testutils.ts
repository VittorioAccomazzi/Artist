import { Canvas, createCanvas, loadImage } from 'canvas';
import {Image2D, isImage} from './imagebase'
import Histogram from './histogram'
import CanvasUtils, {SeqCanvas} from './canvasUtils'
import {imageHash} from 'image-hash'
import * as fs from 'fs'
import * as path from 'path'
import { createTextChangeRange } from 'typescript';


export const tmpFolder = 'tmp'
export const testImage1 = 'src/imglib/testimages/test1.jpg'
export const testImage2 = 'src/imglib/testimages/test2.jpg'
export const testImages = [ testImage1, testImage2]

export async function hash( image : Canvas | Image2D ) : Promise<string> {
    let canvas =  isImage(image) ? toCanvas(image) : image
    let b = canvas.toBuffer('image/png');
    let name = `testImage-${canvas.width}x${canvas.height}.png`
    return new Promise((res, rej)=>{
        imageHash({
            ext: 'image/png',
            data: b,
            name: name
        }, 128, true, (err: Error, val : string )=>{
            if( err ) rej(err)
            res(val)
        })
    })
}

export async function* getCanvases() : AsyncGenerator<[Canvas, CanvasRenderingContext2D, string]>{
    for( let img of testImages) {
        let image = await loadImage(img)
        let canvas= createCanvas(image.width, image.height);
        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        yield [canvas, ctx, path.basename(img,'.jpg')]
    }
}

export function toCanvas(image : Image2D) : Canvas {
    let max = image.maxValue()
    let min = image.minValue()
    let img = image

    if ( max > 255 || min <0 ){
        // no need to convert
        let range = max - min
        let scale = range > 0 ? 254/range : 1
        scale = Math.min(1, scale) // to not scale up.
        let offset = -scale * min
        img = image.convertTo('Uint8', scale, offset)
    }  
    let width = img.width
    let height= img.height
    let canvas= createCanvas(width, height)
    let ctx = canvas.getContext('2d')
    let data = ctx.getImageData(0,0, width, height)
    let pixels= img.imagePixels
    let ptr =0
    for(let y=0; y<height; y++){
        let yOffset = y*width
        for( let x=0; x<width; x++){
            let p = Math.floor(pixels[yOffset+x])
            data.data[ptr++] = p // Red
            data.data[ptr++] = p // Green
            data.data[ptr++] = p // blue
            data.data[ptr++] = 255 // alpha
        }
    }
    ctx.putImageData(data,0,0)
    return canvas
}

export async function dumpImage( image : Image2D, name? : string ){
    let nCanvas = toCanvas(image)
    dumpCanvas(nCanvas,name)
}

export async function dumpCanvas(canvas : Canvas, name? : string ) : Promise<void> {
    let fullname = path.resolve(tmpFolder, name ? name: (await hash(canvas)).substr(0,25))
    if( ! fs.existsSync(tmpFolder)){
        fs.mkdirSync(tmpFolder)
    }
    await saveCanvas(canvas, fullname)
}

export function toSeqCanvas( nCanvas : Canvas ) : SeqCanvas {
    // this is inefficient, but allows to test more code
    let hCanvas = toHTMLCanvas(nCanvas)
    return CanvasUtils.toSeq(hCanvas)
}

export function toHTMLCanvas(nCanvas : Canvas) : HTMLCanvasElement {
    let hCanvas = document.createElement('canvas')
    hCanvas.width = nCanvas.width
    hCanvas.height= nCanvas.height
    let hCtx = hCanvas.getContext('2d')
    let nCtx = nCanvas.getContext('2d')
    let nDat = nCtx.getImageData(0,0,nCanvas.width,nCanvas.height)
    hCtx?.putImageData(nDat, 0, 0)
    return hCanvas
}

export function toNodeCanvas(inCanvas : HTMLCanvasElement | SeqCanvas ) : Canvas {
    let nCanvas = null
    if( isSeqCanvas (inCanvas)  ) {
        // this is more inefficient, but allows to test more code
        let hCanvas =  document.createElement('canvas')
        CanvasUtils.fromSeq(inCanvas,hCanvas)
        nCanvas = toNodeCanvas(hCanvas)
    } else {
        nCanvas = createCanvas(inCanvas.width,inCanvas.height)
        let nCtx = nCanvas.getContext('2d')
        let hCtx = inCanvas.getContext('2d') as CanvasRenderingContext2D
        let hDat = hCtx.getImageData(0,0,nCanvas.width,nCanvas.height) 
        nCtx?.putImageData(hDat, 0, 0) 
    }
    return nCanvas
}

function isSeqCanvas(obj : any ) : obj is SeqCanvas {
    return obj.data != null && obj.width != null && obj.height != null && obj.data.length > 0 
}

async function saveCanvas( canvas : Canvas, filename : string ) : Promise<void>{
    return new Promise( (res,rej)=>{
        const out = fs.createWriteStream(`${filename}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  res())
    })
}

const maxHeight = 512
export  function displayHisto(histo : Histogram , cMap? : string []) : Canvas {
    let maxVal= histo.maxValue
    let bins  = histo.histogramBins
    let scale = Math.min( 1, maxHeight/maxVal)
    let width = bins.length
    let height= Math.floor(scale*maxVal)
    let canvas = createCanvas(width,height)
    let ctx = canvas.getContext('2d')
    ctx.fillStyle="#FFFFFFFF"
    ctx.fillRect(0,0,width,height)
    bins.forEach((v,i)=>{
        let col =  cMap ? cMap[i] : "#0000FFFF"
        ctx.beginPath()
        ctx.strokeStyle= col
        let scaled = Math.floor(v * scale)
        ctx.moveTo(i,height)
        ctx.lineTo(i,height-scaled)
        ctx.stroke()
    })
    return canvas
}

export default {}