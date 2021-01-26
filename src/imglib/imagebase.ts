import { textChangeRangeIsUnchanged } from "typescript";



export class ImageBase {

    private buffer : ArrayBuffer
    private pixels : Uint16Array [] 

    constructor( width : number, height : number ) {
        let nPixels = width * height;
        let bytes  = nPixels * Uint16Array.BYTES_PER_ELEMENT;
        this.buffer= new ArrayBuffer(bytes);
        this.pixels= Array.from(Array(height), (e,i)=>
            new Uint16Array(this.buffer, width*Uint16Array.BYTES_PER_ELEMENT*i, width)
        ) 
    }

    /**
     *  get the image buffer
     */
    get imageBuffer() : ArrayBuffer {
        return this.buffer
    }

    /**
     * get image height
     */
    get height() : number {
        return this.pixels.length
    }

    /**
     * return image height
     */
    get width() : number {
        return this.pixels[0].length
    }

    /**
     * get a pixel value.
     * @param x row of the pixel queried
     * @param y column of the pixel queried
     */
    get( x: number, y: number ) : number {
        if( !this.checkBoundary(x,y)) throw new Error (`Invalid image coordinates queried: image size ${this.width}x${this.height} pixel ${x},${y}`)
        return this.pixels[y][x]
    }

    /**
     * get a row of pixels
     * @param y row of pixels to select.
     */
    getRow(y:number) : Uint16Array {
        if( y<0 || y>this.height )throw new Error (`Invalid y coordinate queried : image height ${this.height} y ${y}`)
        return this.pixels[y]
    }

    /**
     * 
     * @param x row pixel to set
     * @param y column pixel to se
     * @param value  value to set
     */
    set(x:number, y:number, value : number) : void {
        if( !this.checkBoundary(x,y)) throw new Error (`Invalid image coordinates set: image size ${this.width}x${this.height} pixel ${x},${y}`)
        this.pixels[y][x]= value
    }

    /**
     * check that the value passed are valid image coordinates.
     * @param x row
     * @param y column
     */
    private checkBoundary(x: number, y : number ) : boolean {
        return x>=0 && x < this.width && y>=0 && y<this.height
    }

}