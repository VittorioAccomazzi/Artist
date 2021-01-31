import {ImageFactory, Image2D, ImageUint8, ImageUint16} from './imagebase'
import Gradient from './gradient'
import Histogram from './histogram'

const TRUE = 255


/**
 *  Canny Edge detection. for details see https://en.wikipedia.org/wiki/Canny_edge_detector
 */
export default class CannyEdgeDetection {

    /**
     * 
     * @param inImage input image
     * @param lowThr  low threshold (perseage) for the detection of the edges
     * @param highThr  high threshold (persentage ) for the detection of the edges
     */
    static Detect(inImage:Image2D, lowThr : number, highThr : number ) : ImageUint8 {
        let nsImage = this.NonMaxSuppressedImage(inImage)
        let hist = new Histogram(nsImage)
        let lMag = Math.max(1, hist.threshold(lowThr))
        let hMag = Math.max(lMag, hist.threshold(highThr))
        let mask = this.Hysteresis(nsImage, lMag, hMag) 
        return mask
    }

    private static  NonMaxSuppressedImage ( inImage : Image2D ) : ImageUint16 {
        let width = inImage.width
        let height= inImage.height
        let grad = new Gradient(inImage)
        let mag  = grad.magnetude()

        // scale magnetude image
        let scale = 6500/mag.maxValue()
        let scMag = mag.convertTo('Uint16', scale, 0)

        // quantize direction
        const dir_0 =1
        const dir_90=2
        const dir_45=3
        const dir_135=4

        let qAngle = ImageFactory.Uint8(width, height)
        let aPixels= qAngle.imagePixels
        let gradients = grad.gradients()
        gradients.forEach((g,i)=>{
            let [x,y] = g
            let mag_0 = Math.abs(x) // equivalent to |(gx,gy)∘(1,0)|
            let mag_90= Math.abs(y) // equivalent to |(gx,gy)∘(0,1)|
            let mag_45= Math.abs(x+y)/1.4142 // equivalent to |(gx,gy)∘(1,1)/√2|
            let mag_135= Math.abs(x-y)/1.4142 // equivalent to |(gx,gy)∘(1,-1)/√2|
            let mag_max= Math.max(mag_0, mag_90, mag_45, mag_135)
            let dir = dir_0
            if ( mag_90 == mag_max ) dir = dir_90
            else if ( mag_45 == mag_max ) dir = dir_45
            else if ( mag_135 == mag_max ) dir= dir_135
            aPixels[i]=dir
        })

        // Non maximum suppression
        let scPixels = scMag.imagePixels
        for( let y=1; y<height-1; y++){
            let yoffset = y*width
            for( let x=1; x<width-1; x++){
                let p00 = yoffset+x
                let pp0 = yoffset+x+1
                let pn0 = yoffset+x-1
                let p0p = yoffset+width+x
                let ppp = yoffset+width+x+1
                let pnp = yoffset+width+x-1
                let p0n = yoffset-width+x
                let ppn = yoffset-width+x+1
                let pnn = yoffset-width+x-1
                switch(aPixels[p00]){
                    case dir_0:
                        if( scPixels[p00] < Math.max(scPixels[pp0],scPixels[pn0]) ) scPixels[p00]=0
                        break;
                    case dir_90:
                        if( scPixels[p00] < Math.max(scPixels[p0n],scPixels[p0p])) scPixels[p00]=0
                        break;
                    case dir_45:
                        if(scPixels[p00] < Math.max(scPixels[ppp],scPixels[pnn])) scPixels[p00]=0
                        break;
                    case dir_135:
                        if(scPixels[p00] < Math.max(scPixels[pnp],scPixels[ppn])) scPixels[p00]=0
                        break
                }

            }
        }
        return scMag as ImageUint16
    }

    private static Hysteresis( magImage : ImageUint16, lThr : number, hThr : number ) : ImageUint8 {
        let width = magImage.width
        let height= magImage.height
        let mask = ImageFactory.Uint8(width, height)
        for( let y=0; y<height; y++ ){
            for( let x=0; x<width; x++ ){
                if( magImage.get(x,y) >= hThr ) this.Trace(magImage, mask, lThr, x, y)
            }
        }
        return mask
    } 

    private static Trace(magImage : ImageUint16, mask : ImageUint8, thr : number, xPos: number, yPos:number ) : void {
        let width = magImage.width
        let height= magImage.height 
        let stack = Array<[number,number]>()
        stack.push([xPos,yPos])
        mask.set(xPos,yPos, TRUE)
        magImage.set(xPos, yPos, 0)

        while( stack.length > 0 ){
            const [x,y] = stack.pop() as [number,number]
            for( let i=-1; i<2; i++){
                for(let j=-1; j<2; j++){
                    let xp = x + j
                    let yp = y + i
                    if( xp >=0 && yp >=0 && xp < width && yp < height){
                        if( magImage.get(xp, yp) >= thr ){
                            magImage.set(xp, yp, 0)
                            mask.set(xp,yp,TRUE)
                            stack.push([xp, yp])
                        }
                    }
                }
            }
        }
    }
}