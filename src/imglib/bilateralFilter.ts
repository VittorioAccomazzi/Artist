const assert = require('assert')
import { skipPartiallyEmittedExpressions } from 'typescript'
import GaussianFilter from './gaussianFilter'
import {ImageFactory, Image2D, ImagePixels} from './imagebase'

export default class BilateralFilter {

    /**
     * Applies a bilateral filter  on the image `aImg`, `bImg` and `cImg` which are supposed to be 
     * separate channel of the same image (for instance Lab or rgb or Hsv).
     * See :
     *    https://people.csail.mit.edu/sparis/bf_course/slides/03_definition_bf.pdf 
     *    https://people.csail.mit.edu/sparis/bf_course/course_notes.pdf
     * @param aImg  - first channel
     * @param bImg  - second channel
     * @param cImg  - third channel
     * @param sSigma  - space std (applied to location)
     * @param rSigma  - range std (applied to intensity)
     */
    static Run( aImg : Image2D, bImg : Image2D, cImg : Image2D, sSigma : number, rSigma : number ) : [ Image2D, Image2D, Image2D] {

        // clone the images
        let aOut = aImg.convertTo(aImg.imageType)
        let bOut = bImg.convertTo(bImg.imageType)
        let cOut = cImg.convertTo(cImg.imageType)

        let width = aImg.width
        let height= aImg.height
        let sKerenl = this.buildSpaceWeights(sSigma)
        let rKernel = this.buildRangeWeights(rSigma)
        let hKernel = (sKerenl.length-1)/2

        for( let y=0; y<height; y++ ){
            for(let x=0; x<width; x++){

                let a = aImg.get(x,y)
                let b = bImg.get(x,y)
                let c = cImg.get(x,y)
                let wSum = 0
                let af = 0
                let bf = 0
                let cf = 0

                // filter location x,y
                for( let dy=-hKernel; dy<= hKernel; dy++ ){
                    for( let dx=-hKernel; dx<=hKernel; dx++){
                        let xp = dx + x
                        let yp = dy + y
                        if( xp>=0 && yp>=0 && xp< width && yp<height){
                            let ap = aImg.get(xp,yp)
                            let bp = bImg.get(xp,yp)
                            let cp = cImg.get(xp,yp)
                            let da = ap-a
                            let db = bp-b
                            let dc = cp-c
                            let dst= Math.round(Math.sqrt(da*da+db*db+dc*dc))
    
                            let spaceWeight = sKerenl[dy+hKernel][dx+hKernel]
                            let rangeWeight = dst < rKernel.length ? rKernel[dst] : 0
                            let weight = spaceWeight * rangeWeight
    
                            if( weight > 0 ){
                                wSum += weight
                                af += ap * weight
                                bf += bp * weight
                                cf += cp * weight
                            }
                        }
                    }
                }

                assert(wSum > 0 )
                aOut.set(x,y,af/wSum)
                bOut.set(x,y,bf/wSum)
                cOut.set(x,y,cf/wSum)
            }
        }
        return [aOut, bOut, cOut]
    }

    /**
     * generate a 2D Gaussian kernel using the separable property of the gaussian
     * @param sigma std
     */
    private static buildSpaceWeights( sigma : number) : number [][] {
        let kernel1D = GaussianFilter.buildKernel(sigma)
        let kernel2D = new Array(kernel1D.length).fill(null).map(()=>new Array(kernel1D.length).fill(0))
        kernel2D.forEach((row : number [] , y: number)=>{
            row.forEach( (v : number, x : number ) => kernel2D[y][x]=kernel1D[y]*kernel1D[x]);
        })
        return kernel2D
    }

    /**
     * generate the 1D kernel for the range gaussian, which start at location x=0
     * @param sigma std
     */
    private static buildRangeWeights( sigma : number ) : number [] {
        let kernel1D = GaussianFilter.buildKernel(sigma)
        assert( kernel1D.length %2 == 1)
        let hLen = (kernel1D.length-1)/2
        let hkernel = new Array(hLen).fill(0)
        hkernel.forEach((v,i)=>hkernel[i]=kernel1D[i+hLen])
        return hkernel
    }

}