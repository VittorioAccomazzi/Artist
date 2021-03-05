
import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, overlayTensor, overlayTangent, toNodeCanvas, toCanvas } from './testutils'
import {ImageFactory, ImageFloat32} from './imagebase'
import CanvasUtils from './canvasUtils'
import TensorDirSmoothing from './tensorDirSmoothing'
import TensorGenerator, { TensorRelax } from './tensorGenerator'

test('shall smooth in the min eigen vec direction',async()=>{
    let width = 80
    let height= 99
    let bck = 50
    let frg = 100
    let image = ImageFactory.Uint8(width,height)
    let pixels= image.imagePixels
    pixels.forEach((v,i)=>{
        let y = (i/width | 0) 
        let x = (i%width)
        let val = bck
        if( x==y ){
            val=frg+(x | 0)
        }
        pixels[i]=val
    })
    let tf = TensorGenerator.Run(image, image, image, 1)
    let tI = overlayTensor(toCanvas(image), tf, 2)
    // await dumpCanvas(tI, `input tensor`)
    let hsh = await hash(tI)
    expect(hsh).toMatchSnapshot()

    let [filtered] = TensorDirSmoothing.Run(image, image, image, 3)
    tI = overlayTensor(toCanvas(filtered), tf, 2)
    // await dumpCanvas(tI, `filtered with tensor Smoothing`)
    hsh = await hash(tI)
    expect(hsh).toMatchSnapshot()
})

test('shall smooth the image preserving edges',async()=>{
  
    let relaxSettings : [string,TensorRelax|undefined] []=  [['no relax',undefined], ['with relax',{nIterations:2, tau : 20000}]]
    for( const [status, relax ] of relaxSettings ){
        for await ( const [canvas,ctx,name] of getCanvases() ) {
            let [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
            const nIterations = 3
            // await dumpCanvas(canvas, `image ${name}`)
            for( let i=0; i< nIterations; i++){
                [lImg, aImg, bImg ] = TensorDirSmoothing.Run(lImg, aImg, bImg , 2, relax) as [ ImageFloat32, ImageFloat32, ImageFloat32]
                let image = toNodeCanvas(CanvasUtils.fromLab(lImg, aImg, bImg))
                // await dumpCanvas(image,`image ${name} DirSmoothing ${i} ${status}`)
    
                let hsh = await hash(image)
                expect(hsh).toMatchSnapshot()
            }
        }
    }
},5*60*1000)