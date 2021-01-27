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
    
        let gassian = GaussianFilter.Run(image, kernelSize)
        let canvas  = toNodeCanvas( CanvasUtils.Compose(gassian, gassian, gassian) )
        await dumpImage( canvas, `Gaussian-psf-${kernelSize}`)
    
        let gHash = hash(canvas)
        expect(gHash).toMatchSnapshot()
    }
})

test('validate hash', async()=>{
    for await ( const [canvas] of getCanvases() ) {
        const [ red, green, blue] = CanvasUtils.Split(toHTMLCanvas(canvas)) 
        let gRed   = GaussianFilter.Run(red, 4)
        let gGreen = GaussianFilter.Run(green, 4)
        let gBlue  = GaussianFilter.Run(blue, 4)
        const gaussian = toNodeCanvas(CanvasUtils.Compose(gRed, gGreen, gBlue))
        let hsh = hash(gaussian)
        expect(hsh).toMatchSnapshot()
    }
})
