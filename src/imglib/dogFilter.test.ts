import {hash, getCanvases, toSeqCanvas, dumpImage, dumpCanvas, toNodeCanvas} from './testutils'
import {ImageFactory} from './imagebase'
import CanvasUtils from './canvasUtils'
import DifferenceOfGaussian from './dogFilter'

test('shall detect edges', async ()=>{

    let width = 320
    let height= 281
    let int1 = 100
    let int2 = 200
    let image = ImageFactory.Uint8(width,height)

    // first intensity
    image.imagePixels.forEach((v,i)=>image.imagePixels[i]=int1)

    // second intensity
    for( let y=Math.floor(height*0.3); y<Math.floor(height*0.8); y++){
        for( let x=Math.floor(width*0.4); x<Math.floor(width*0.8); x++){
            image.set(x,y,int2)
        }
    }

    let sSigma = 3
    let lSigma = Math.sqrt(1.6) * sSigma
    let sensitivity = 0.98
    let sharpness = 1
    let dogImage = DifferenceOfGaussian.Run( image, sSigma, lSigma, sensitivity, sharpness)
    let scaledDog= dogImage.convertTo('Uint8', 254,0)
    let hsh = await hash(scaledDog)
    expect(hsh).toMatchSnapshot()

    // await dumpImage(scaledDog,`dog - 3, 0.98, 1 `)
})

test('shall detect edges on Luminosity component ', async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        const [ inL ] = CanvasUtils.toLab(toSeqCanvas(canvas)) 

        let sSigma = 2
        let lSigma = 1.6 * sSigma
        let sensitivity = 0.98
        let sharpness = 1
        let dogImage = DifferenceOfGaussian.Run( inL, sSigma, lSigma, sensitivity, sharpness)
        let scaledDog= dogImage.convertTo('Uint8', 254,0)
        let hsh = await hash(scaledDog)
        expect(hsh).toMatchSnapshot()
    
         //await dumpImage(scaledDog, `dog edges on ${name}`)
    }
})