import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, toNodeCanvas } from './testutils'
import CanvasUtils from './canvasUtils'
import { ImageFactory, ImageFloat32 } from './imagebase'
import ShockFilter from './shockFilter'

test('shall enhance edges', async ()=>{
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

    // await dumpImage(image, 'Shock input image')
    let shkImage = ShockFilter.Run(image, 2, 0.0001, 2 )
    // await dumpImage(logImage, 'Sock  image')
    let hsh = await hash(shkImage)
    expect(hsh).toMatchSnapshot();

})


test('shall enhance edges',async()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))
        
        let shkImg = ShockFilter.Run(lImg, 2, 0.0001, 4) as ImageFloat32
        // await dumpImage( shkImg, `Shock image ${name}`)
        let hsh = await hash(shkImg)
        expect(hsh).toMatchSnapshot()

        let sCanvas = CanvasUtils.fromLab(shkImg, aImg, bImg)
        // dumpCanvas(toNodeCanvas(sCanvas), `Shock enhannced ${name}`)
        hsh = await hash(toNodeCanvas(sCanvas))
        expect(hsh).toMatchSnapshot()
    }
},60*2*1000)