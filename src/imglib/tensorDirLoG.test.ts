import {ImageFactory} from './imagebase'
import CanvasUtils from './canvasUtils'
import { dumpCanvas, dumpImage, getCanvases, hash, overlayTangent, overlayTensor, toCanvas, toNodeCanvas, toSeqCanvas } from './testutils'
import TensorGenerator from './tensorGenerator'
import TensorDirLoG from './tensorDirLoG'
import GaussianFilter from './gaussianFilter'

test('shall detect edges',async ()=>{
    let width = 55
    let height= 88
    let bck = 100
    let frg = 250
    let img = ImageFactory.Uint16(width,height)
    let pixels = img.imagePixels
    pixels.forEach((v,i)=>pixels[i]=bck)
    let xStart = 20
    let xEnd = width-xStart
    let yStart = 15
    let yEnd = height-yStart
    for( let y=yStart; y<yEnd; y++ ){
        for( let x=xStart; x<xEnd; x++ ){
            img.set(x,y,frg)
        }
    }

    let tf = TensorGenerator.Run(img, img, img, 1 )
    let flt= TensorDirLoG.Run(img, tf, 2)

    let canvas = toCanvas(img)
    let tensor = overlayTensor(canvas, tf, 2)
    // await dumpCanvas(tensor,`tensor LoG Test image`)
    let hTensor = await hash(canvas)
    expect(hTensor).toMatchSnapshot()


    let filter = overlayTensor(toCanvas(flt),tf, 2)
    // await dumpCanvas(filter, `shock tensor LoG filtered image`)
    let hFilter = await hash(tensor)
    expect(hFilter).toMatchSnapshot()
})

test('shall find the local image variation',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg] = CanvasUtils.toLab(toSeqCanvas(canvas))
        
        GaussianFilter.Run(lImg,1)
        let tf = TensorGenerator.Run(lImg, aImg, bImg, 1) 
        let flt= TensorDirLoG.Run(lImg, tf, 1.5)
        // await dumpImage(flt, `tensor LoG image ${name}`)
        let hsh = await hash(flt)
        expect(hsh).toMatchSnapshot()
    }
},60*2*1000)