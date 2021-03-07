import {hash, getCanvases, toSeqCanvas, dumpImage, dumpCanvas, toNodeCanvas, toCanvas} from './testutils'
import {ImageFactory} from './imagebase'
import IntensityQuantization from './intensityQuantization'

test('shall quantize the image', async ()=>{

    let width = 320
    let height= 281
    let int1 = 100
    let int2 = 250
    let xCenter = 160
    let yCenter = 140
    let radius = 100

    let image = ImageFactory.Uint8(width,height)

    // first intensity
    image.imagePixels.forEach((v,i)=>image.imagePixels[i]=int1)

    // second intensities
    for(let y=0; y<height; y++){
        for(let x=0; x<width; x++){
            let dx = x-xCenter 
            let dy = y-yCenter
            let dst= Math.sqrt( dx*dx+dy*dy)
            if( dst < radius ){
                let w = dst/radius
                w *= w // on prpose do not make it linear
                let int = Math.floor(w * int1 + (1-w)*int2 )
                image.set(x,y,int)
            }
        }
    }

    let img0 = image.convertTo(image.imageType)
    let img1 = image.convertTo(image.imageType)
    let img2 = image.convertTo(image.imageType)

    //await dumpImage(image,`gradient image`)

    IntensityQuantization.Run(img0,15,0)
    //await dumpImage(img0,`gradient image quantized 0`)
    let hsh0 = await hash(img0)
    expect(hsh0).toMatchSnapshot()

    IntensityQuantization.Run(img1,15,1)
    //await dumpImage(img1,`gradient image quantized 1`)
    let hsh1 = await hash(img1)
    expect(hsh1).toMatchSnapshot()

    IntensityQuantization.Run(img2,15,2)
    //await dumpImage(img2,`gradient image quantized 2`)
    let hsh2 = await hash(img2)
    expect(hsh2).toMatchSnapshot()

})