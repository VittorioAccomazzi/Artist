import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, toNodeCanvas } from './testutils'
import CanvasUtils from './canvasUtils'
import { ImageFactory } from './imagebase'
import LoGFilter from './LoGFilter'

test('shall detect edges', async ()=>{
    let width = 200
    let height= 280
    let bck = 50
    let frg = 100
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

    //await dumpImage(image, 'LoG input image')
    let logImage = LoGFilter.Run(image, 2)
    //await dumpImage(logImage, 'LoG  image')
    let hsh = await hash(logImage)
    expect(hsh).toMatchSnapshot();

})

test('shall enhance edges',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
        
        let logImg = LoGFilter.Run(lImg, 2)
        // await dumpImage( logImg, `loG image ${name}`)
        let hsh = await hash(logImg)
        expect(hsh).toMatchSnapshot()

        let lPixels = logImg.imagePixels
        let scale = 0.001
        lPixels.forEach((v,i)=>lImg.imagePixels[i]+= scale * v)

        let sCanvas = CanvasUtils.fromLab(lImg, aImg, bImg)
        // dumpCanvas(toNodeCanvas(sCanvas), `enhannced ${name}`)
        hsh = await hash(toNodeCanvas(sCanvas))
        expect(hsh).toMatchSnapshot()
    }
},60*2*1000)