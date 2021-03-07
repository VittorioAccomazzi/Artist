import { Canvas } from "canvas"
import CanvasUtils from "./canvasUtils"
import GaussianFilter from "./gaussianFilter"
import { Image2D, ImageFactory, ImageFloat32 } from "./imagebase"
import TensorGenerator from "./tensorGenerator"
import TensorShock from './tensorShock'
import { dumpCanvas, getCanvases, overlayTensor, toCanvas, toNodeCanvas, toSeqCanvas } from "./testutils"
import {hash} from './testutils'

test('shall smooth enhance edges',async()=>{

    for( const [image, name] of sampleImages()){
        let tf = TensorGenerator.Run(image, image, image, 1)
        let tI = overlayTensor(toCanvas(image), tf, 2)
        // await dumpCanvas(tI, `input tensor ${name}`)
        let hsh = await hash(tI)
        expect(hsh).toMatchSnapshot()
    
        let filtered = TensorShock.Run(image, tf, 1.5, 0.01, 2 )
        tI = overlayTensor(toCanvas(filtered), tf, 2)
        //await dumpCanvas(tI, `filtered with tensor Smoothing ${name}`)
        hsh = await hash(tI)
        expect(hsh).toMatchSnapshot()
    }

},30*1000)

function sampleImages() : [Image2D, string ][]{
    let width = 120
    let height= 180
    let bck = 50
    let frg = 100
    let image1= ImageFactory.Uint8(width,height)
    let pixels= image1.imagePixels
    pixels.forEach((v,i)=>{
        let y = (i/width | 0) 
        let x = (i%width)
        let val = bck
        if( x< y ) val = frg
        pixels[i]=val
    })
    GaussianFilter.Run(image1,2)
    let image2= ImageFactory.Uint8(width,height)
    pixels= image2.imagePixels
    pixels.forEach((v,i)=>{
        let y = (i/width | 0) 
        let x = (i%width)
        let val = bck
        if( Math.abs(x-y)<3 ) val = frg + (x/3|0)
        pixels[i]=val
    })

    return [[image1,'test1'],[image2,'test2']]
}

test('shall enhance edges',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg] = CanvasUtils.toLab(toSeqCanvas(canvas))
        
        GaussianFilter.Run(lImg,1)
        let tf = TensorGenerator.Run(lImg, aImg, bImg, 1) 
        let flt= TensorShock.Run(lImg, tf, 2, 0.01, 2) as ImageFloat32
        let cns= CanvasUtils.fromLab(flt, aImg, bImg)
        // await dumpCanvas( toNodeCanvas(cns), `tensor Shock ${name}`)
        let hsh = await hash(flt)
        expect(hsh).toMatchSnapshot()
    }
},60*2*1000)