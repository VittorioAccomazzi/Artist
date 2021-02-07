
interface TypedArray {
    readonly length : number;
    [n: number]: number;
    buffer : ArrayBuffer;
    reduce ( func : (total : number, currentValue : number, index : number ) => number, initialvalue : number) : number;
}

interface TypedArrayConstructor<T extends TypedArray> {
    new (buffer: ArrayBuffer, byteOffset?: number, length?: number): T;
}

export type ImageUint8  = ImageBase<Uint8Array,Uint8ArrayConstructor>
export type ImageUint16 = ImageBase<Uint16Array,Uint16ArrayConstructor>
export type ImageFloat32= ImageBase<Float32Array,Float32ArrayConstructor>

// this is the generic Image type. Using this approach we avoid to expose
// the complexity of the generic used below.

export type Image2D = ImageUint8 | ImageUint16 | ImageFloat32
export type ImagePixels = Uint8Array | Uint16Array | Float32Array
export type ImageType = 'Uint8' | 'Uint16' | 'Float32'


export function isImage( obj : any ) : obj is Image2D {
    return obj.imagePixels != null
}

export class ImageFactory {

    static Uint8( width : number, height : number ) : ImageUint8 {
        return new ImageBase<Uint8Array,Uint8ArrayConstructor>(Uint8Array.BYTES_PER_ELEMENT, Uint8Array, width, height)
    }
    static Uint16( width : number, height : number ) : ImageUint16{
        return (new ImageBase<Uint16Array,Uint16ArrayConstructor>(Uint16Array.BYTES_PER_ELEMENT, Uint16Array, width, height)) 
    }
    static Float32( width : number, height : number ): ImageFloat32{
        return new ImageBase<Float32Array,Float32ArrayConstructor>(Float32Array.BYTES_PER_ELEMENT, Float32Array, width, height)
    }
    static Image(type : ImageType, width : number, height : number ) : Image2D {
        switch( type ){
            case 'Uint8':
                return ImageFactory.Uint8(width,height)
            case 'Uint16':
                return ImageFactory.Uint16(width,height)
            case 'Float32':
                return ImageFactory.Float32(width,height)
        }
    }
}


class ImageBase<T extends TypedArray, C extends TypedArrayConstructor<T>> {

    private buffer : T
    private pixels : T [] 

    constructor( elementSize : number, constructor : C, width : number, height : number ) {
        let nPixels= width * height;
        let bytes  = nPixels * elementSize
        let buffer= new ArrayBuffer(bytes);
        this.pixels= Array.from(Array(height), (e,i)=> new constructor (buffer, width*elementSize*i, width) ) 
        this.buffer= new constructor(buffer, 0, nPixels)
    }


    /**
     * get type of pixel stored.
     */
    get imageType(): ImageType {
        return this.pixels[0].constructor.name.replace('Array','') as ImageType
    }

    /**
     * returns the current list of pixels.
     */
    get imagePixels(): T {
        return this.buffer 
    }

    /**
     *  get the image buffer
     */
    get imageBuffer() : ArrayBuffer {
        return this.buffer.buffer
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
     * max pixel value in the image
     */
    maxValue() : number {
        return this.buffer.reduce((max, val, idx)=>Math.max(val,max),this.buffer[0])
    }

    /**
     * min pixel value in the image
     */
    minValue() : number {
        return this.buffer.reduce((min, val, idx)=>Math.min(val,min),this.buffer[0])
    }

    /**
     * get a row of pixels
     * @param y row of pixels to select.
     */
    getRow(y:number) : T {
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
     * convert and copy this image in a new image.
     * @param type outpt image type
     * @param slope multiplication factor applied to every pixel in the conversion
     * @param intercept intercept used for every pixel in the conversion
     */
    convertTo(type : ImageType, slope? : number, intercept? : number) : Image2D {
        let dstImage = ImageFactory.Image(type, this.width, this.height)
        let dstPixels= dstImage.imagePixels
        if( slope !=null  && intercept != null ){
            dstPixels.forEach((v :number,i:number)=>dstPixels[i]=slope * this.buffer[i]+intercept)
        } else {
            dstPixels.forEach((v :number,i:number)=>dstPixels[i]=this.buffer[i])
        }
        return dstImage
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