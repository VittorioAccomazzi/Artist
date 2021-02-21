import { O_TRUNC } from 'constants';
import GaussianFilter from './gaussianFilter';
import { Image2D } from './imagebase';
import TensorField from './tensorField';
import TensorGenerator from './tensorGenerator';

export default class TensorFilter {
    static Run( image : Image2D , sigma : number ) : Image2D {
        let tf = TensorGenerator.Run(image,sigma)
        let kernel = GaussianFilter.buildKernel(sigma)
        return this.directionalSmoothing(image, tf, kernel)
    }

    private static directionalSmoothing( image : Image2D, tf : TensorField, kernel : number [] ) : Image2D {
        // this is the brute force method
        let len = (kernel.length-1)/2
        let out = image.convertTo(image.imageType)
        let width = image.width
        let height= image.height

        for( let y=0; y<height; y++ ){
            for( let x=0; x<width; x++ ){
                let t = tf.get(x,y)
                if( t.minVal > 0 ){
                    // blur in the direction of the eigen vector
                    let wSum = 0
                    let iSum = 0 
                    for( let l=-len; l<=len; l++){
                        let xSample = Math.round( x + l * t.minVec[0] )
                        let ySample = Math.round( y + l * t.minVec[1] )
                        if( xSample >=0 && xSample < width && ySample >=0 && ySample < height ){
                            wSum += kernel[l+len]
                            iSum += kernel[l+len] * image.get(xSample,ySample)
                        }
                    }
                    iSum /= wSum
                    out.set(x,y,iSum)
                }
            }
        }

        return out;
    }

}