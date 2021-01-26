import { Canvas, createCanvas, loadImage } from 'canvas';
import {imageHash} from 'image-hash'
import * as fs from 'fs'
import * as path from 'path'


export const tmpFolder = 'tmp'
export const testImage1 = 'src/imglib/testimages/test1.jpg'
export const testImage2 = 'src/imglib/testimages/test2.jpg'
export const testImages = [ testImage1, testImage2]

export async function hash( canvas : Canvas) : Promise<string> {
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

export async function* getCanvases() : AsyncGenerator<[Canvas, CanvasRenderingContext2D]>{
    for( let img of testImages) {
        let image = await loadImage(img)
        let canvas= createCanvas(image.width, image.height);
        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        yield [canvas, ctx]
    }
}

export async function dumpImage(canvas : Canvas, name? : string ) : Promise<void> {
    let fullname = path.resolve(tmpFolder, name ? name: (await hash(canvas)).substr(0,25))
    if( ! fs.existsSync(tmpFolder)){
        fs.mkdirSync(tmpFolder)
    }
    await saveCanvas(canvas, fullname)
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

export function toNodeCanvas(hCanvas : HTMLCanvasElement) : Canvas {
    let nCanvas = createCanvas(hCanvas.width,hCanvas.height)
    let hCtx = hCanvas.getContext('2d') as CanvasRenderingContext2D
    let nCtx = nCanvas.getContext('2d')
    let hDat = hCtx.getImageData(0,0,nCanvas.width,nCanvas.height) 
    nCtx?.putImageData(hDat, 0, 0)  
    return nCanvas
}


export async function saveCanvas( canvas : Canvas, filename : string ) : Promise<void>{
    return new Promise( (res,rej)=>{
        const out = fs.createWriteStream(`${filename}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  res())
    })
}

export default {}