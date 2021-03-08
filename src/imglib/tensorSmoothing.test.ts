import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, overlayTensor, overlayTangent, toNodeCanvas, toCanvas, randomPoints } from './testutils'
import {ImageFactory, ImageFloat32} from './imagebase'
import CanvasUtils from './canvasUtils'
import TensorSmoothing from './tensorSmoothing'
import TensorGenerator, { TensorRelax } from './tensorGenerator'

test('shall smooth while preserving edges',async()=>{
    let width = 200
    let height= 280
    let bck = 50
    let frg = 100
    let err = 5
    let image = ImageFactory.Uint8(width,height)
    let pixels= image.imagePixels
    pixels.forEach((v,i)=>{
        let y = (i/width | 0) 
        let x = (i%width)
        let val = bck
        if( Math.abs(x-y)<8 ){
            val=frg+(x | 0)
        }
        pixels[i]=val
    })

    // add noise
    let points = randomPoints(width,height)
    points.forEach((point, index )=>{
        let val = image.get(point.x, point.y)
        val += err * ( index%2 ===0 ? 1 : -1) 
        image.set(point.x, point.y, val)   
    })

    let tf = TensorGenerator.Run(image, image, image, 1)
    let tI = overlayTensor(toCanvas(image), tf, 2)
    // await dumpCanvas(tI, `input tensor`)
    let hsh = await hash(tI)
    expect(hsh).toMatchSnapshot()

    let [filtered] = TensorSmoothing.Run(image, image, image, 3)
    tI = overlayTensor(toCanvas(filtered), tf, 2)
    // await dumpCanvas(tI, `filtered with tensor Smoothing`)
    hsh = await hash(tI)
    expect(hsh).toMatchSnapshot()
})

test('shall smooth the image preserving edges',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
        const nIterations = 3
        // await dumpCanvas(canvas, `image ${name}`)
        for( let i=0; i< nIterations; i++){
            [lImg, aImg, bImg ] = TensorSmoothing.Run(lImg, aImg, bImg , 2) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            let image = toNodeCanvas(CanvasUtils.fromLab(lImg, aImg, bImg))
            // await dumpCanvas(image,`image ${name} tensor Smoothing ${i} ${status}`)

            let hsh = await hash(image)
            expect(hsh).toMatchSnapshot()
        }
    }
},5*60*1000)