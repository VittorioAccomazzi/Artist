import {ImageFactory, Image2D, ImagePixels} from './imagebase'

export default class GaussianFilter {

    /**
     * filters in place the input image.
     * @param inImg input and output image
     * @param sigma kernel size
     */
    static Run(inImg : Image2D, sigma : number)  {

        if( sigma <0 ) throw Error ( `Invalid Gaissian Sigma : ${sigma}` )

        const kernel = GaussianFilter.buildKernel(sigma)
        
        const width = inImg.width
        const height= inImg.height
        const iPixel= inImg.imagePixels

        GaussianFilter.applySeparableKernel(iPixel, kernel, width, height)

    }

     private static buildKernel(sigma : number ) : number [] {
          // Choose a kernel radius such that the gaussian is down to about ~0.1 at the kernel edges
         let kernelRadius = Math.ceil(1.5 * sigma)
         kernelRadius = kernelRadius < 1 ? 1 : kernelRadius

         // kernel values
         let kernel : number [] = (new Array(kernelRadius*2+1)).fill(0)
         let  expFactor = 1.0 / (sigma * sigma);
         for (let n = 0; n <= kernelRadius; n++)
         {
             kernel[kernelRadius + n] = Math.exp(-expFactor * (n * n));
             kernel[kernelRadius - n] = kernel[kernelRadius + n];
         }

         // normalize
         let sum = kernel.reduce((sum, val)=>sum+val,0)
         return kernel.map(v=>v/sum)
     }

     private static applySeparableKernel( iPixels : ImagePixels, kernel : number [], width : number, height : number  ) : void {
        let tmpImage = ImageFactory.Float32(width, height)
        let tPixels = tmpImage.imagePixels
        let kRadius = (kernel.length-1)/2

        // first pass -- apply on rows
        for( let y=0; y<height; y++ ){
            let yOffset = y*width
            for(let x=0; x<width; x++ ){
                let sum =0;
                let start = x - kRadius
                for( let k=0; k<kernel.length; k++){
                    let pos = start +k
                    if( pos < 0 ) pos *= -1;
                    if( pos >= width ) pos = 2* width -2 -pos
                    sum += kernel[k]*iPixels[pos+yOffset]
                }
                tPixels[yOffset+x] = sum
            }    
        }

        // second pass -- apply on columns
        for( let x=0; x<width; x++){
            for( let y=0; y<height; y++ ){
                let sum =0
                let start = y - kRadius
                for( let k=0; k<kernel.length; k++ ){
                    let pos = start + k
                    if( pos < 0 ) pos *= -1
                    if( pos >= height) pos = 2*height-2 -pos
                    sum += kernel[k]*tPixels[pos*width+x]
                }
                iPixels[y*width+x]=sum
            }
        }
     }

}