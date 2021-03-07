import { Image2D } from './imagebase';
import TensorDirLoG from './tensorDirLoG';
import TensorField from './tensorField';

export default class TensorShock{

    static Run(inImage : Image2D, tf : TensorField, sigma : number, tau : number, radius : number ) : Image2D {
        let width = inImage.width
        let height= inImage.height
        let ouImage = inImage.convertTo(inImage.imageType)
        let logImage= TensorDirLoG.Run(inImage,tf, sigma)

        for( let y=radius; y<height-radius; y++){
            for( let x=radius; x<width-radius; x++ ){
                let {majVec, minVec}= tf.get(x,y)
                let logVal = logImage.get(x,y)
                let majMag = majVec[0] * majVec[0] + majVec[1]*majVec[1]
                if( Math.abs(logVal)> tau && majMag > 0 ){
                    let min = Number.MAX_VALUE
                    let max = -min
                    for( let l=-radius; l<= radius; l++){
                        let xSample = x + majVec[0] * l
                        let ySample = y + majVec[1] * l
                        let val1 = this.Sample(inImage, xSample, ySample, minVec, 0.0 )
                        let val2 = this.Sample(inImage, xSample, ySample, minVec, 0.5 )
                        let val3 = this.Sample(inImage, xSample, ySample, minVec, -0.5)
                        max = Math.max(val1, val2, val3, max)
                        min = Math.min(val1, val2, val3, min)
                    }
                    let val = logVal < 0 ? max : min
                    ouImage.set(x,y,val)
                }
            }
        }

        return ouImage
    }

    private static Sample( image : Image2D, xPos : number, yPos : number, offset : [ number, number], scale : number  ) : number{
        let xSample = xPos + offset[0] * scale
        let ySample = yPos + offset[1] * scale
        let x = Math.round(xSample)
        let y = Math.round(ySample)
        return image.get(x,y)
    }

}