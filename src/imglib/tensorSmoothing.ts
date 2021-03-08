import BilateralFilter from './bilateralFilter';
import { Image2D } from './imagebase';
import TensorField from './tensorField';
import TensorGenerator, { TensorRelax } from './tensorGenerator';

export default class TensorSmoothing {
    static Run( c1 : Image2D , c2 : Image2D, c3 : Image2D, sigma : number, relax? : TensorRelax ) : [ Image2D, Image2D, Image2D ]  {
        let tf = TensorGenerator.Run(c1, c2, c3 ,sigma, relax)
        let kernel = BilateralFilter.buildSpaceWeights(sigma)
        return this.directionalSmoothing(c1, c2, c3, tf, kernel)
    }

    private static directionalSmoothing( c1 : Image2D , c2 : Image2D, c3 : Image2D, tf : TensorField, kernel : number [][] ) : [ Image2D, Image2D, Image2D ] {
        // this is the brute force method
        let len = (kernel.length-1)/2
        let c1Out = c1.convertTo(c1.imageType)
        let c2Out = c2.convertTo(c2.imageType)
        let c3Out = c3.convertTo(c3.imageType)
        let width = c1.width
        let height= c1.height

        for( let y=0; y<height; y++ ){
            for( let x=0; x<width; x++ ){

                // get direction and size
                let t = tf.get(x,y)
                if( t.majVal > 0 ) {
                    let scale = 1-((t.majVal-t.minVal)/(t.majVal+t.minVal))
                    let xMin = t.minVec[0]
                    let yMin = t.minVec[1]
                    let xMaj = t.majVec[0]
                    let yMaj = t.majVec[1]

                    // blur in the direction of the minor eigen vector
                    let wSum = 0
                    let c1Sum = 0
                    let c2Sum = 0
                    let c3Sum = 0

                    // sample step along minVec is 1 -- this is x in the loop below
                    // sample step along majVec is scale. -- this is y in loop below

                    for( let yK=-len; yK<=len; yK++ ){
                        let xMj = yK * scale * xMaj
                        let yMj = yK * scale * yMaj
                        for( let xK=-len; xK<=len; xK++ ){
                            let xMn = xK * xMin
                            let yMn = xK * yMin
                            let xSample = Math.round( x + xMj + xMn )
                            let ySample = Math.round( y + yMj + yMn )
                            if( xSample >=0 && xSample < width && ySample >=0 && ySample < height){
                                let weight = kernel[yK+len][xK+len]
                                wSum  += weight
                                c1Sum += weight * c1.get(xSample,ySample)
                                c2Sum += weight * c2.get(xSample,ySample)
                                c3Sum += weight * c3.get(xSample,ySample)
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
        }

        return [c1Out, c2Out, c3Out]
    }
}