import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, overlayTensor, overlayTangent, toCanvas } from './testutils'
import TensorGenerator from './tensorGenerator'
import {ImageFactory} from './imagebase'
import {randomPoints} from './testutils'
import CanvasUtils from './canvasUtils'
import { FitnessCenter } from '@material-ui/icons'

test('shall  generate orthogonal tensors',()=>{
    let width = 88
    let height= 55
    let base = 100
    let high = 120
    let image = ImageFactory.Uint8(width,height)
    
    let pixels = image.imagePixels
    pixels.forEach((v,i)=>pixels[i]=base)

    // add noise
    let points = randomPoints(width, height)
    for( let {x,y} of points ){
        image.set(x,y,high)
    }

    let tf = TensorGenerator.Run(image, image, image, 1)

    tf.fieldTensors.forEach( ({majVec, minVec, majVal, minVal}) =>{
       let dot = majVec[0]*minVec[0]+majVec[1]*minVec[1]
       expect(dot).toBeCloseTo(0,3)
       expect(majVal).toBeGreaterThanOrEqual(0)
       expect(minVal).toBeGreaterThanOrEqual(0)
    })

})

test('shall detect edge orientation',async()=>{
    let width = 88
    let height= 55
    let xOff = 5
    let yOff = 3
    let nx = 24
    let ny = 18
    let base = 100
    let high = 120
    let image = ImageFactory.Uint8(width,height)
    let pixels = image.imagePixels
    pixels.forEach((v,i)=>pixels[i]=base)
    for( let y=0; y<ny; y++){
        for( let x=0; x<nx; x++){
            image.set(xOff+x, yOff+y, high)
        }
    }

    let tf = TensorGenerator.Run(image, image, image, 1)

    // horizontal tensor
    let hTensor = tf.get(xOff+nx/2,yOff)
    expect(hTensor.minVal).toBeCloseTo(0,3)
    expect(dir(hTensor.majVec)[1]).toBeCloseTo(1)
    expect(dir(hTensor.minVec)[0]).toBeCloseTo(1)

    // vertical tensor
    let vTensor = tf.get(xOff,yOff+ny/2)
    expect(vTensor.minVal).toBeCloseTo(0,3)
    expect(dir(vTensor.majVec)[0]).toBeCloseTo(-1)
    expect(dir(vTensor.minVec)[1]).toBeCloseTo(-1)

    // cornet tensor
    let cTensor = tf.get(xOff,yOff)  
    expect(cTensor.majVal).toBeGreaterThan(0)
    expect(cTensor.minVal).toBeGreaterThan(0)
    expect(cTensor.majVec[0]).not.toBeCloseTo(0,3)
    expect(cTensor.majVec[1]).not.toBeCloseTo(0,3) 
    expect(cTensor.minVec[0]).not.toBeCloseTo(0,3)
    expect(cTensor.minVec[1]).not.toBeCloseTo(0,3) 

    //middle tensor
    let mTensor = tf.get(xOff+nx/2,yOff+ny/2)
    expect(mTensor.majVal).toBeCloseTo(0,3)
    expect(mTensor.majVec[0]).toBeCloseTo(0,3)
    expect(mTensor.majVec[1]).toBeCloseTo(0,3)
})

function dir(val : [ number,number]) :[number, number ]{
    let mag = Math.sqrt(val[0]*val[0]+val[1]*val[1])
    return [ val[0]/mag,  val[1]/mag]
}


test('shall compute eigen values correctly',async()=>{
    // test case taken from https://courses.cs.washington.edu/courses/cse455/09wi/Lects/lect6.pdf 
    // slide 25

    let square = 20
    let width = square * 4
    let height= square * 4
    let image = ImageFactory.Uint8(width,height)
    for( let y=0; y<height; y++){
        for( let x=0; x<width; x++){
            let xSq = Math.floor(x/square)
            let ySq = Math.floor(y/square)
            let val = (xSq+ySq)%2 ===0 ? 0 : 100
            image.set(x,y,val)
        }
    }

    //await dumpImage(image,`checkboard`)
    let tf = TensorGenerator.Run(image, image, image, 1) 

    let minImage = ImageFactory.Float32(width,height)
    let majImage = ImageFactory.Float32(width,height)

    tf.fieldTensors.forEach((v,index)=>{
        minImage.imagePixels[index] = v.minVal
        majImage.imagePixels[index] = v.majVal
    })

    // dump
    //dumpImage(majImage,`Major`)
    //dumpImage(minImage,`Minor`)
    let majHsh = await hash(majImage)
    let minHsh = await hash(minImage)

    expect(majHsh).toMatchSnapshot()
    expect(minHsh).toMatchSnapshot()

})

test('shall find the local image variation',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg] = CanvasUtils.toLab(toSeqCanvas(canvas))
        
        let tf = TensorGenerator.Run(lImg, aImg, bImg, 1) 

        let tfCanvas = overlayTensor(canvas, tf)
        let tgCanvas = overlayTangent(canvas, tf)

        let hsh1 = await hash( tfCanvas)
        expect(hsh1).toMatchSnapshot()

        let hsh2 = await hash( tgCanvas)
        expect(hsh2).toMatchSnapshot()

        // await dumpCanvas(tfCanvas,`tensor field canvas ${name}`) 
        // await dumpCanvas(tgCanvas,`tangent field canvas ${name}`) 
    }
},2*60*1000)

test('shall be able to relax the tensor field', async()=>{
    let width = 250
    let height= 200
    let image = ImageFactory.Uint8(width,height)
    let pixels= image.imagePixels
    pixels.forEach((v,i)=>{
        let y = (i/width | 0) 
        let x = (i%width)
        let val = y
        if( Math.abs(x-90)<4 ) val = 254
        pixels[i]=val
    })
    let points = randomPoints(width,height)

    // add noise
    points.forEach((p,i)=>{
        let v = image.get(p.x,p.y)
        v = i%2 ? v+1 : v-1
        image.set(p.x, p.y,v)
    })

    // generate tensof no relax 
    let tf = TensorGenerator.Run(image, image, image, 1)
    let tfOverlay = overlayTangent(toCanvas(image), tf, 2)
    // await dumpCanvas(tfOverlay,`Image with no relax`)
    let hsh = await hash(tfOverlay)
    expect(hsh).toMatchSnapshot()

    tf = TensorGenerator.Run(image, image, image, 1, { nIterations:2, tau : 31000})
    tfOverlay = overlayTangent(toCanvas(image), tf, 2)
    // await dumpCanvas(tfOverlay,`Image with with relax`)
    hsh = await hash(tfOverlay)
    expect(hsh).toMatchSnapshot()

}, 60*1000)

