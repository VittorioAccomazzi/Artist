import {Image2D, ImageUint16, ImageUint8} from './imagebase'


export default class GradientQuantization {

    /**
     * Generate a smooth quantization of the image. The image content will be replaces (in place quantization)
     * @param image input image
     * @param binSize bin size for the quantization
     * @param sharpness sharpness of the transition 0 - staircase
     */
    static Run( image : Image2D, binSize : number  =10, sharpness : number =1 ) {
        let pixels = image.imagePixels
        pixels.forEach((v:number,i :number )=>{
            let qtx = Math.floor(v/binSize)
            let val = binSize*(qtx+0.5)
            val += binSize/2*Math.tanh(sharpness *(v-val))
            pixels[i]=val
        })
    }

}