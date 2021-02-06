import {hash, getCanvases, toSeqCanvas, dumpImage} from './testutils'
import {ImageFactory} from './imagebase'
import CanvasUtils from './canvasUtils'
import GaussianFilter from './gaussianFilter'
import CannyEdgeDetection from './cannyED'

test('shall detect clear borders', async ()=>{
    let width = 25
    let height= 32
    let img8 = ImageFactory.Uint8(width, height)
    let size = 8
    let x0 = Math.floor((width-size)/2)
    let y0 = Math.floor((height-size)/2)
    for( let y=0; y<size; y++ ){
        for( let x=0; x<size; x++){
            img8.set(x0+x,y0+y,10)
        }
    }
    for( let y=1; y<size-1; y++ ){
        for( let x=1; x<size-1; x++){
            img8.set(x0+x,y0+y,5)
        }
    }
    let canny = CannyEdgeDetection.Detect(img8, 0.1, 1.0)
    await dumpImage(canny,'canny8')
    let hsh = await hash(canny)
    expect(hsh).toMatchSnapshot()
})

test('shall find edges on real images',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let int = CanvasUtils.toGrayScale(toSeqCanvas(canvas))
        let canny = CannyEdgeDetection.Detect(int, 0.98, 0.99)
        await dumpImage(canny,`canny-${name}`)
        let hsh = await hash(canny)
        expect(hsh).toMatchSnapshot()
    }
})

test('shall find edges on filtered images',async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let int = CanvasUtils.toGrayScale(toSeqCanvas(canvas))
        let flt = GaussianFilter.Run(int,2.0)
        let canny = CannyEdgeDetection.Detect(int, 0.98, 0.99)
        await dumpImage(canny,`canny-filt-${name}`)
        let hsh = await hash(canny)
        expect(hsh).toMatchSnapshot()
    }
})