import {hash, getCanvases, toSeqCanvas, dumpImage, dumpCanvas, toNodeCanvas} from './testutils'
import {ImageFactory, ImageFloat32, ImageUint8} from './imagebase'
import {randomPoints} from './testutils'
import CanvasUtils from './canvasUtils'
import BilateralFilter from './bilateralFilter'

test('shall reduce noise and preserve edges', async ()=>{

    let width = 320
    let height= 281
    let int1 = 100
    let int2 = 200
    let inte = 10
    let image = ImageFactory.Uint8(width,height)

    // first intensity
    image.imagePixels.forEach((v,i)=>image.imagePixels[i]=int1)

    // second intensity
    for( let y=Math.floor(height*0.3); y<Math.floor(height*0.8); y++){
        for( let x=Math.floor(width*0.4); x<Math.floor(width*0.8); x++){
            image.set(x,y,int2)
        }
    }

    // add noise
    let points = randomPoints(width,height)
    points.forEach((point, index )=>{
        let val = image.get(point.x, point.y)
        val += inte * ( index%2 ===0 ? 1 : -1) 
        image.set(point.x, point.y, val)   
    })

    let inpHash = await hash(image)
    expect(inpHash).toMatchSnapshot()
    //await dumpImage(image,`noise input image`)

    const [ aImg ] = BilateralFilter.Run(image, image, image, 20, 40)

    let outHash = await hash(image)
    expect(outHash).toMatchSnapshot()
    //await dumpImage(aImg,`bilateral filter image`)

},2*60*1000)

test('shall filter with RGB decomposition', async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [ inRed, inGreen, inBlue] = CanvasUtils.toRGB(toSeqCanvas(canvas)) 
        const [ ouRed, ouGreen, ouBlue] = BilateralFilter.Run(inRed, inGreen, inBlue, 6, 12)
        const ouImage = CanvasUtils.fromRGB(ouRed as ImageUint8, ouGreen as ImageUint8, ouBlue as ImageUint8)
        let outHash = await hash(toNodeCanvas(ouImage))
        expect(outHash).toMatchSnapshot()
        //await dumpCanvas(toNodeCanvas(ouImage),`RGB bilateral ${name}`) 
    }
}, 2*60*1000)

test('shall filter with LAB decomposition', async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [ inL, inA, inB] = CanvasUtils.toLab(toSeqCanvas(canvas)) 
        const [ ouL, ouA, ouB] = BilateralFilter.Run(inL, inA, inB, 6, 12)
        const ouImage = CanvasUtils.fromLab(ouL as ImageFloat32, ouA as ImageFloat32, ouB as ImageFloat32)
        let outHash = await hash(toNodeCanvas(ouImage))
        expect(outHash).toMatchSnapshot()
        //await dumpCanvas(toNodeCanvas(ouImage),`LAB bilateral ${name}`) 
    }
}, 2*60*1000)

test('shall filter with HSV decomposition', async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [ inH, inS, inV] = CanvasUtils.toHSV(toSeqCanvas(canvas)) 
        // scale S and V to have the same range of H
        let reS = inS.convertTo(inS.imageType,360,0)
        let reV = inV.convertTo(inV.imageType,360,0)
        const [ ouH, ouS, ouV] = BilateralFilter.Run(inH, reS, reV, 6, 18) //different scale
        reS = ouS.convertTo(ouS.imageType,1/360,0)
        reV = ouV.convertTo(ouV.imageType,1/360,0)
        const ouImage = CanvasUtils.fromHSV(ouH as ImageFloat32, reS as ImageFloat32, reV as ImageFloat32)
        let outHash = await hash(toNodeCanvas(ouImage))
        expect(outHash).toMatchSnapshot()
        //await dumpCanvas(toNodeCanvas(ouImage),`HSV bilateral ${name}`) 
    }
}, 5*60*1000)