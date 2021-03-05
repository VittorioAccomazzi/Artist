import TensorField, {tensor, zeroTensor} from './tensorField'
import {Image2D, ImageFactory, ImageFloat32} from './imagebase'
import Gradient from './gradient'
import GaussianFilter from './gaussianFilter'

export interface TensorRelax {
    tau : number,
    nIterations : number
}

export default class TensorGenerator {

    static Run( c1 : Image2D, c2 : Image2D, c3 : Image2D, sigma : number, relax? : TensorRelax  ) : TensorField {
        let [dx2, dy2, dxy]= this.filterComponents(c1, c2, c3, sigma)
        if( relax ) [dx2, dy2, dxy ] = this.relax(dx2, dy2, dxy, relax )

        // https://courses.cs.washington.edu/courses/cse455/09wi/Lects/lect6.pdf slide 21 and 22
        // notice that the major eigenvectors are computed a descibed in 
        let width = c1.width
        let height= c1.height
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
    static relax(dx2: ImageFloat32, dy2: ImageFloat32, dxy: ImageFloat32, param: TensorRelax): [ImageFloat32, ImageFloat32, ImageFloat32] {
        let width = dx2.width
        let height= dx2.height
        let thrshd= param.tau * param.tau
        for( let n=0; n<param.nIterations; n++){
            let ox2= ImageFactory.Float32(width,height)
            let oy2= ImageFactory.Float32(width,height)
            let oxy= ImageFactory.Float32(width,height)
            for( let y=1; y<height-1; y++){
                for( let x=1; x<width-1; x++){
                    let x2 = dx2.get(x,y)
                    let y2 = dy2.get(x,y)
                    let xy = dxy.get(x,y)
                    let mag= x2*x2+y2*y2+2*xy*xy
                    if( mag < thrshd ){
                        x2 = this.average(dx2, x, y)
                        y2 = this.average(dy2, x, y)
                        xy = this.average(dxy, x, y)
                    }
                    ox2.set(x,y,x2)
                    oy2.set(x,y,y2)
                    oxy.set(x,y,xy)
                }
            }
            dx2 = ox2
            dy2 = oy2
            dxy = oxy
        }
        return [dx2, dy2, dxy]
    }
    static average(img: ImageFloat32, x: number, y: number): number {
        let v1 = img.get(x-1, y)
        let v2 = img.get(x, y-1)
        let v3 = img.get(x+1, y)
        let v4 = img.get(x, y+1)
        return (v1+v2+v3+v4)/4
    }


    private static filterComponents(c1 : Image2D, c2 : Image2D, c3: Image2D, sigma : number) : [ImageFloat32, ImageFloat32, ImageFloat32] {
        // Wiki https://en.wikipedia.org/wiki/Structure_tensor
        let c1Grad = new Gradient( c1 )
        let c2Grad = new Gradient( c2 )
        let c3Grad = new Gradient( c3 )
        let width = c1.width
        let height= c2.height
        let xComp = ImageFactory.Float32(width, height)
        let yComp = ImageFactory.Float32(width, height)
        let xyComp= ImageFactory.Float32(width, height)
        let c1Pixels= c1Grad.gradients()
        let c2Pixels= c2Grad.gradients()
        let c3Pixels= c3Grad.gradients()
        let xPixels = xComp.imagePixels
        let yPixels = yComp.imagePixels
        let xyPixels= xyComp.imagePixels
        xPixels.forEach((v,i)=>xPixels[i]=c1Pixels[i][0] * c1Pixels[i][0] + c2Pixels[i][0] * c2Pixels[i][0] + c3Pixels[i][0] * c3Pixels[i][0])
        yPixels.forEach((v,i)=>yPixels[i]=c1Pixels[i][1] * c1Pixels[i][1] + c2Pixels[i][1] * c2Pixels[i][1] + c3Pixels[i][1] * c3Pixels[i][1])
        xyPixels.forEach((v,i)=>xyPixels[i]=c1Pixels[i][0] * c1Pixels[i][1] + c2Pixels[i][0] * c2Pixels[i][1] + c3Pixels[i][0] * c3Pixels[i][1])
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