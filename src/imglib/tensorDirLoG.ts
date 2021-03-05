import { Image2D, ImageFactory, ImageFloat32 } from './imagebase';
import TensorField from './tensorField';

export default class TensorDirLoG {
    static Run( inImg : Image2D, tf : TensorField, sigma : number ) : ImageFloat32 {
        let width = inImg.width
        let height= inImg.height
        let ouImg = ImageFactory.Float32(width,height)


        let hKernel = Math.ceil(5 * sigma)
        let sigma2 = sigma*sigma
        let weights= Array(hKernel+1).fill(0).map((v,i)=>(i*i-sigma2)* Math.exp(-i*i/(2*sigma2)))
        let den = (Math.sqrt(2*Math.PI)*sigma2*sigma2)
        for(let y=hKernel; y<height-hKernel; y++){
            for( let x=hKernel; x<width-hKernel; x++){

                // Laplacian of Gaussian
                let t = tf.get(x,y)
                let sum = weights[0] * inImg.get(x,y) // value at location 0
                for( let l=1; l<=hKernel; l++){
                    let dx= t.majVec[0]*l
                    let dy= t.majVec[1]*l
                    let c = inImg.get(Math.round(x+dx),Math.round(y+dy)) + // value along the positive direction at location l
                            inImg.get(Math.round(x-dx),Math.round(y-dy))   // value alonng the negative dir at location l
                    sum += weights[l] * c
                }
                sum -sum/den

                ouImg.set(x,y,sum)
            }
        }
        return ouImg
    } 
}