import GaussianFilter from './gaussianFilter';
import { Image2D } from './imagebase';
import TensorField from './tensorField';
import TensorGenerator from './tensorGenerator';

export default class TensorDirSmoothing {
    static Run( c1 : Image2D , c2 : Image2D, c3 : Image2D, sigma : number ) : [ Image2D, Image2D, Image2D ]  {
        let tf = TensorGenerator.Run(c1, c2, c3 ,sigma)
        let kernel = GaussianFilter.buildKernel(sigma)
        return this.directionalSmoothing(c1, c2, c3, tf, kernel)
    }

    private static directionalSmoothing( c1 : Image2D , c2 : Image2D, c3 : Image2D, tf : TensorField, kernel : number [] ) : [ Image2D, Image2D, Image2D ] {
        // this is the brute force method
        let len = (kernel.length-1)/2
        let c1Out = c1.convertTo(c1.imageType)
        let c2Out = c2.convertTo(c2.imageType)
        let c3Out = c3.convertTo(c3.imageType)
        let width = c1.width
        let height= c1.height

        for( let y=0; y<height; y++ ){
            for( let x=0; x<width; x++ ){
                let t = tf.get(x,y)
                if( t.minVal > 0 ){
                    // blur in the direction of the eigen vector
                    let wSum = 0
                    let c1Sum = 0 
                    let c2Sum = 0
                    let c3Sum = 0
                    for( let l=-len; l<=len; l++){
                        let xSample = Math.round( x + l * t.minVec[0] )
                        let ySample = Math.round( y + l * t.minVec[1] )
                        if( xSample >=0 && xSample < width && ySample >=0 && ySample < height ){
                            wSum += kernel[l+len]
                            c1Sum += kernel[l+len] * c1.get(xSample,ySample)
                            c2Sum += kernel[l+len] * c2.get(xSample,ySample)
                            c3Sum += kernel[l+len] * c3.get(xSample,ySample)
                        }
                    }
                    c1Sum /= wSum
                    c2Sum /= wSum
                    c3Sum /= wSum
                    c1Out.set(x,y,c1Sum)
                    c2Out.set(x,y,c2Sum)
                    c3Out.set(x,y,c3Sum)
                }
            }
        }

        return [c1Out, c2Out, c3Out]
    }

}