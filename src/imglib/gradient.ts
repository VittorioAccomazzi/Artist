import {ImageFactory, Image2D, ImagePixels} from './imagebase'

export default class Gradient {
    private grad : number[][][] 
    constructor(image : Image2D){
        this.grad = this.generateGradients(image)
    }

    /**
     * width of the gradient image
     */
    get width() : number {
        return this.grad[0].length
    }

    /**
     * length of the gradient image
     */
    get height() : number {
        return this.grad.length
    }

    /**
     *  retun a gradient as an array with x and y components
     * @param x x location of the gradient
     * @param y y location of the gradient
     */
    gradient(x:number, y:number) : number[] {
        if( x< 0 || x>= this.width || y<0 || y>=this.height) throw Error(`requested invalid gradient at ${x},${y}`)
        return this.grad[y][x]
    }

    private generateGradients( image : Image2D ) : number[][][] {
        let width = image.width
        let height= image.height
        let pixels= image.imagePixels
        // notice the use of 'map' which is necessary to void to have the same reference in each array
        let gr : number[][][] = Array(height).fill([]).map(()=>Array(width).fill([]).map(()=>[0,0]))

        for( let y=1; y<height-1; y++ ){
            let y0 = y*width    // y offset
            let yp = y0+width   // y+1 offeset
            let yn = y0-width   // y-1 offset
            for( let x=1; x<width-1; x++){
                // sobel kernel
                let xp = yp+x
                let x0 = y0+x
                let xn = yn+x
                let gx = 2 * pixels[xp]+pixels[xp+1]+pixels[xp-1]
                       - 2 * pixels[xn]-pixels[xn+1]-pixels[xn-1]
                let gy = 2 * pixels[x0+1]+pixels[xn+1]+pixels[xp+1]
                       - 2 * pixels[x0-1]-pixels[xn-1]-pixels[xp-1] 
                gr[y][x]=[gx,gy]
            }
        }

        return gr
    }
}