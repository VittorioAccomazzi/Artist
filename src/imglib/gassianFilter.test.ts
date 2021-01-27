import {hash, getCanvases, toHTMLCanvas, toNodeCanvas, dumpImage} from './testutils'
import {ImageFactory} from './imagebase'
import CanvasUtils from './canvasUtils'
import GaussianFilter from './GassianFilter'

test('check PSF for Gaussian Filter', async ()=>{
    let kernelSizes : number [] = [ 10, 5, 2 ]
    for( let kernelSize  of  kernelSizes ){
        let width = 512
        let height= 641
        let image = ImageFactory.Uint8(width,height)
        let size = 8
        let xStart = Math.ceil((width-size)/2)
        let yStart = Math.ceil((height-size)/2)
        for( let y=0; y<size; y++){
            for( let x=0; x<size; x++ ){
                image.set(xStart+x, yStart+y, 255)
            }
        }
    
        GaussianFilter.Run(image, kernelSize)
        let canvas  = toNodeCanvas( CanvasUtils.Compose(image, image, image) )
        await dumpImage( canvas, `Gaussian-psf-${kernelSize}`)
    
        let gHash = await hash(canvas)
        expect(gHash).toMatchSnapshot()
    }
})

test('shall support all images types', async ()=>{
    let width = 512
    let height= 641
    let image8= ImageFactory.Uint8(width,height)
    let image16= ImageFactory.Uint16(width,height)
    let image32= ImageFactory.Float32(width, height)
    let size = 8
    let xStart = Math.ceil((width-size)/2)
    let yStart = Math.ceil((height-size)/2)
    for( let y=0; y<size; y++){
        for( let x=0; x<size; x++ ){
            image8.set(xStart+x, yStart+y, 255)
            image16.set(xStart+x, yStart+y, 255)
            image32.set(xStart+x, yStart+y, 255)
        }
    } 
    GaussianFilter.Run(image8, 5)
    GaussianFilter.Run(image16, 5) 
    GaussianFilter.Run(image32, 5) 

    let pixels8 = image8.imagePixels
    let pixels16= image16.imagePixels
    let pixels32= image32.imagePixels

    let diff1 = pixels16.map((v,i)=>v-pixels8[i])
    let diff2 = pixels32.map((v,i)=>v-pixels8[i])

    expect(diff1.every((v)=>v==0)).toBe(true)
    expect(diff2.every((v)=>Math.abs(v)<1)).toBe(true)

})

test('shall match baseline hash', async()=>{
    for await ( const [canvas] of getCanvases() ) {
        const [ red, green, blue] = CanvasUtils.Split(toHTMLCanvas(canvas)) 
        GaussianFilter.Run(red, 4)
        GaussianFilter.Run(green, 4)
        GaussianFilter.Run(blue, 4)
        const gaussian = toNodeCanvas(CanvasUtils.Compose(red, green, blue))
        let hsh = await hash(gaussian)
        expect(hsh).toMatchSnapshot()
    }
})
