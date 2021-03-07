const assert = require('assert')
import GaussianFilter from './gaussianFilter'
import {Image2D, ImageFactory, ImageFloat32} from './imagebase'

export default class DifferenceOfGaussian {


    /**
     * Applies the difference of gaussian, where sSigma < lSigma.
     * See Real-time video abstraction 
     *   https://www.researchgate.net/publication/220184181_Real-time_video_abstraction
     * section 3.2 on page 4
     * @param inImage input image
     * @param sSigma small sigma. It determines the spatial scale for edge detection
     * @param lSigma large sigma.
     * @param sensitivity sensitivity of the edge detector. For small values, less noise is detected, but real edges become less prominent. As it approaches 1, the filter becomes increasingly unstable. Typical value 0.98
     * @param sharpness determines the sharpness of edge representations, typically in [0.75,5.0]
     */
    static Run( inImage : Image2D, sSigma : number, lSigma : number, sensitivity : number = 0.98, sharpness : number  = 3 ) :  ImageFloat32 {
        let width = inImage.width
        let height= inImage.height
        let ouImage = ImageFactory.Float32(width, height)

        let sImage = inImage.convertTo(inImage.imageType) // copy
        let lImage = inImage.convertTo(inImage.imageType) // copy

        GaussianFilter.Run(sImage,sSigma)
        GaussianFilter.Run(lImage,lSigma)

        let sPixels = sImage.imagePixels
        let lPixels = lImage.imagePixels
        let oPixels = ouImage.imagePixels

        sPixels.forEach((val : number , index : number )=>{
            let v = val - sensitivity * lPixels[index]
            let r = 1
            if( v <0 ) r = 1+ Math.tanh(sharpness*v)
            oPixels[index]=r
        })
        
        return ouImage
    }
}
