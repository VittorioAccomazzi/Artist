import TensorField, {tensor, zeroTensor} from './tensorField'
import {Image2D, ImageFactory, ImageFloat32} from './imagebase'
import Gradient from './gradient'
import GaussianFilter from './gaussianFilter'


export default class TensorGenerator {

    static Run( image : Image2D, sigma : number ) : TensorField {
        const [dx2, dy2, dxy]= this.filterComponents(image, sigma)

        // https://courses.cs.washington.edu/courses/cse455/09wi/Lects/lect6.pdf slide 21 and 22
        // notice that the major eigenvectors are computed a descibed in 
        let width = image.width
        let height= image.height
        let tensors : tensor[] = Array<tensor>(width*height).fill(zeroTensor).map((i, index )=>{
            let x2 = dx2.imagePixels[index]
            let y2 = dy2.imagePixels[index]
            let xy = dxy.imagePixels[index]
            let d = Math.sqrt((x2-y2)*(x2-y2)+4*xy*xy)
            let majVal = (x2+y2+d)/2
            let minVal = (x2+y2-d)/2
            let majVec : [number, number]= this.normalize([2*xy,y2-x2+d]) // http://scipp.ucsc.edu/~haber/ph116A/diag2x2_11.pdf 
            let minVec : [number, number]= this.normalize([2*xy,y2-x2-d])
            if( this.isZero(xy)){
                // handle the degenerate case. In this case either x2 or y2 are zero and the matrix
                // has a single value. Here we mmake sure that either both eigenvector are zeros 
                // or none.
                if( this.isZero(majVec[1])) majVec=[minVec[1],-minVec[0]]
                if( this.isZero(minVec[1])) minVec=[majVec[1],-majVec[0]]
            }

            return {majVec, minVec, majVal, minVal}
        })
        return new TensorField(tensors, width)
    }


    private static filterComponents(image : Image2D, sigma : number) : [ImageFloat32, ImageFloat32, ImageFloat32] {
        // Wiki https://en.wikipedia.org/wiki/Structure_tensor
        let grad = new Gradient( image )
        let xComp = ImageFactory.Float32(grad.width, grad.height)
        let yComp = ImageFactory.Float32(grad.width, grad.height)
        let xyComp= ImageFactory.Float32(grad.width, grad.height)
        let grPixels= grad.gradients()
        let xPixels = xComp.imagePixels
        let yPixels = yComp.imagePixels
        let xyPixels= xyComp.imagePixels
        xPixels.forEach((v,i)=>xPixels[i]=grPixels[i][0] * grPixels[i][0])
        yPixels.forEach((v,i)=>yPixels[i]=grPixels[i][1] * grPixels[i][1])
        xyPixels.forEach((v,i)=>xyPixels[i]=grPixels[i][0] * grPixels[i][1])
        GaussianFilter.Run(xComp,sigma)
        GaussianFilter.Run(yComp,sigma)
        GaussianFilter.Run(xyComp,sigma)
        return [xComp,yComp,xyComp]
    }

    private static normalize( inVec : [number, number]) : [ number, number ] {
        let [x,y] = inVec
        let mag = Math.sqrt(x*x+y*y)
        if( !this.isZero(mag)) {
            x /= mag
            y /= mag
        }
        return [x,y]
    }

    private static isZero(val : number ) : boolean {
        return Math.abs(val) < 0.000001
    }

}