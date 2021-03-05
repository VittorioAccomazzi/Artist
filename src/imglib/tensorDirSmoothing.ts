import GaussianFilter from './gaussianFilter';
import { Image2D } from './imagebase';
import TensorField from './tensorField';
import TensorGenerator, { TensorRelax } from './tensorGenerator';

const maxAngle = 30

export default class TensorDirSmoothing {
    static Run( c1 : Image2D , c2 : Image2D, c3 : Image2D, sigma : number, relax? : TensorRelax ) : [ Image2D, Image2D, Image2D ]  {
        let tf = TensorGenerator.Run(c1, c2, c3 ,sigma, relax)
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
        let minCos= Math.cos(maxAngle*Math.PI/180)

        for( let y=0; y<height; y++ ){
            for( let x=0; x<width; x++ ){
                // blur in the direction of the eigen vector
                let wSum = kernel[len]
                let c1Sum = kernel[len] * c1.get(x,y)
                let c2Sum = kernel[len] * c2.get(x,y)
                let c3Sum = kernel[len] * c3.get(x,y)

                for( let d of [-1,1] ){
                    let dir = this.mult(tf.get(x,y).minVec, d)
                    let xSample = x
                    let ySample = y
                    for( let l=1; l<=len; l++) {
                        xSample = Math.round(xSample+dir[0])
                        ySample = Math.round(ySample+dir[1])
                        if( xSample >=0 && xSample < width && ySample >=0 && ySample < height ){
                            let minV = tf.get(xSample, ySample).minVec
                            let dotP = this.dot(dir, minV)
                            if( Math.abs(dotP) < minCos ) break // angle too big
                            if( dotP < 0 ) minV= this.mult(minV,-1)
                            wSum += kernel[len+l]
                            c1Sum += kernel[len+l] * c1.get(xSample,ySample)
                            c2Sum += kernel[len+l] * c2.get(xSample,ySample)
                            c3Sum += kernel[len+l] * c3.get(xSample,ySample)
                            dir = minV
                        } else {
                            break; // done.
                        }
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

        return [c1Out, c2Out, c3Out]
    }

    private static dot( v1 : [number, number], v2 : [number, number]) : number {
        return v1[0]*v2[0]+v1[1]*v2[1]
    }

    private static mult( v : [number, number], s : number ) : [number, number] {
        return [s*v[0],s*v[1]]
    }

}