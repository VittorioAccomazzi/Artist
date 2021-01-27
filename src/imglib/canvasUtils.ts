import {ImageFactory, ImageUint8} from './imagebase'

export default class CanvasUtils {

    /**
     *  Generate the canvas's channels (red, green, blue and alpha) in separate images.
     * @param canvas 
     */
    static Split( canvas : HTMLCanvasElement ) : [ ImageUint8, ImageUint8, ImageUint8, ImageUint8 ] {
        let width = canvas.width
        let height= canvas.height
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        let data= ctx.getImageData(0,0,width,height)
        let imgR= ImageFactory.Uint8(width,height)
        let imgG= ImageFactory.Uint8(width,height)
        let imgB= ImageFactory.Uint8(width,height)
        let imgA= ImageFactory.Uint8(width,height)
        let nPixels = width*height
        let i =0
        let cPixels = data.data
        let rPixels = imgR.imagePixels
        let gPixels = imgG.imagePixels
        let bPixels = imgB.imagePixels
        let aPixels = imgA.imagePixels
    
        for( let p=0; p<nPixels; p++){
            rPixels[p]=cPixels[i++]
            gPixels[p]=cPixels[i++]
            bPixels[p]=cPixels[i++]
            aPixels[p]=cPixels[i++]
        }
    
        return [ imgR, imgG, imgB, imgA ]
    }

    /**
     * generate a canvas object using the images provided as channels.
     * @param imgR 
     * @param imgG 
     * @param imgB 
     * @param imgA 
     */
    static Compose( imgR : ImageUint8, imgG : ImageUint8, imgB : ImageUint8, imgA? : ImageUint8 ): HTMLCanvasElement {
        let width = imgR.width
        let height= imgR.height
        let canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height= height
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        let data= ctx.getImageData(0,0,width,height)
        let nPixels = width*height
        let i =0
        let cPixels = data.data
        let rPixels = imgR.imagePixels
        let gPixels = imgG.imagePixels
        let bPixels = imgB.imagePixels
        let aPixels = imgA?.imagePixels
    
        for( let p=0; p<nPixels; p++){
            cPixels[i++] = rPixels[p]
            cPixels[i++] = gPixels[p]
            cPixels[i++] = bPixels[p]
            cPixels[i++] = aPixels ? aPixels[p] : 255
        }

        ctx.putImageData(data,0,0)

        return canvas
    }

}