import { Image2D, ImageFactory, ImageFloat32 } from './imagebase';
import LoGFilter from './LoGFilter'


export default class StockFilter {
    static Run( inImg : Image2D, sigma : number, scale : number, kernelSize : number ) : Image2D {
        let log = LoGFilter.Run(inImg, sigma)
        return this.morphology(inImg, log, scale, kernelSize)
    }

    private static morphology( inImg : Image2D, logImg : ImageFloat32, scale : number, kernelSize : number ) : Image2D {
        let width = inImg.width
        let height= inImg.height
        let ouImg = inImg.convertTo(inImg.imageType)
        for( let y=0; y<height; y++){
            for( let x=0; x<width; x++) {
                let log = logImg.get(x,y)
                let mSize = Math.round( Math.tanh(Math.abs(log)*scale)*kernelSize)
                if( mSize > 0 ){
                    let min = Number.MAX_VALUE
                    let max = -min
                    for( let i=-mSize; i<=mSize; i++){
                        let y0= y+i
                        if( y0 >=0 && y0<height ){
                            for( let j=-mSize; j<=mSize; j++){
                                let x0= x+j
                                if( x0>=0 && x0<width ){
                                    let val = inImg.get(x0,y0)
                                    max = Math.max(val, max)
                                    min = Math.min(val, min)
                                }
                            }
                        }
                    }
                    if( log > 0 ) ouImg.set(x,y, max)
                    else ouImg.set(x,y,min)
                }
            }
        }
        return ouImg
    }
}