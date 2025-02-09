import {ImageFactory, ImageFloat32, ImageUint8} from './imagebase'
const assert = require('assert')

/**
 * Simple interface used to sequentialize the canvas data from application to 
 * backgrounnd workers
 */
export interface SeqCanvas {
    width : number,
    height: number,
    data : Uint8Array // expected to be width * height * 3 with RGB values.
} 

export default class CanvasUtils {

    /**
     * given a canvas object sequantialize the content in `SeqCanvas` 
     * @param canvas html canvas object
     */
    static toSeq( canvas : HTMLCanvasElement ) : SeqCanvas {
        let width = canvas.width
        let height= canvas.height
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        let data= ctx.getImageData(0,0,width,height)
        let seq : SeqCanvas = {
            width :width,
            height: height,
            data : new Uint8Array(width * height * 3)
        }
        let cPtr =0
        let sPtr =0
        for( let i=0; i<width*height; i++){
            seq.data[sPtr++] = data.data[cPtr++] // R
            seq.data[sPtr++] = data.data[cPtr++] // G
            seq.data[sPtr++] = data.data[cPtr++] // B
            cPtr++ // A
        }
        return seq
    }

    /**
     * deserialize the `inCanvas` object in to `outCanvas`
     * @param inCanvas input SeqCanvas object
     * @param outCanvas output canvas
     */
    static fromSeq( inCanvas : SeqCanvas, outCanvas : HTMLCanvasElement ) : void {
        if( inCanvas.width * inCanvas.height * 3 !== inCanvas.data.length ) throw Error(`Invalid SeqCanvas, with ${inCanvas.width}, height ${inCanvas.height} and length ${inCanvas.data.length}`)
        outCanvas.width = inCanvas.width
        outCanvas.height= inCanvas.height
        let ctx = outCanvas.getContext('2d')
        if( ctx ){
            let data= ctx.getImageData(0,0, inCanvas.width, inCanvas.height)
            let cPtr =0
            let sPtr =0
            for( let i=0; i<inCanvas.width*inCanvas.height; i++){
                data.data[cPtr++] = inCanvas.data[sPtr++]
                data.data[cPtr++] = inCanvas.data[sPtr++]
                data.data[cPtr++] = inCanvas.data[sPtr++]
                data.data[cPtr++] = 255 // A
            }
            ctx.putImageData(data,0,0)
        }
    }

    /**
     *  Generate the canvas's channels (red, green, blue and alpha) in separate images.
     * @param canvas 
     */
    static toRGB( canvas : SeqCanvas ) : [ ImageUint8, ImageUint8, ImageUint8 ] {
        let width = canvas.width
        let height= canvas.height
        let imgR= ImageFactory.Uint8(width,height)
        let imgG= ImageFactory.Uint8(width,height)
        let imgB= ImageFactory.Uint8(width,height)
        let nPixels = width*height
        let i =0
        let cPixels = canvas.data
        let rPixels = imgR.imagePixels
        let gPixels = imgG.imagePixels
        let bPixels = imgB.imagePixels
    
        for( let p=0; p<nPixels; p++){
            rPixels[p]=cPixels[i++]
            gPixels[p]=cPixels[i++]
            bPixels[p]=cPixels[i++]
        }
    
        return [ imgR, imgG, imgB ]
    }

    /**
     * generate a canvas object using the images provided as channels.
     * @param imgR 
     * @param imgG 
     * @param imgB 
     * @param imgA 
     */
    static fromRGB( imgR : ImageUint8, imgG : ImageUint8, imgB : ImageUint8 ): SeqCanvas {
        let width = imgR.width
        let height= imgR.height
        let canvas= { width, height, data : new Uint8Array(width*height*3)}
        let nPixels = width*height
        let i =0
        let cPixels = canvas.data
        let rPixels = imgR.imagePixels
        let gPixels = imgG.imagePixels
        let bPixels = imgB.imagePixels
    
        for( let p=0; p<nPixels; p++){
            cPixels[i++] = rPixels[p]
            cPixels[i++] = gPixels[p]
            cPixels[i++] = bPixels[p]
        }

        return canvas
    }

    /**
     * convert the input canvas in intensity (Gray Scale)
     * @param srcImg input canvas
     */
    static toGrayScale( srcImg : SeqCanvas ) : ImageFloat32 {
        let width = srcImg.width
        let height= srcImg.height
        let dstImg= ImageFactory.Float32(width,height)
        let pixels= dstImg.imagePixels
        let data= srcImg.data
        let ptr =0
        for(let p=0; p<pixels.length;p++ ){
            let r=data[ptr++]
            let g=data[ptr++]
            let b=data[ptr++]
            // see https://en.wikipedia.org/wiki/Grayscale
            pixels[p] = 0.299*r+0.587*g+0.114*b

        }
        return dstImg
    }

    /**
     *  decompose the current canvas in hue, saturation and value
     * @param image inpout canvas
     */
    static toHSV( image : SeqCanvas ) : [ ImageFloat32, ImageFloat32, ImageFloat32] {
        let width = image.width
        let height= image.height
        let hImg= ImageFactory.Float32(width,height)
        let sImg= ImageFactory.Float32(width,height) 
        let vImg= ImageFactory.Float32(width,height) 
        let hPixels= hImg.imagePixels
        let sPixels= sImg.imagePixels
        let vPixels= vImg.imagePixels
        let data= image.data
        let ptr =0
        for(let p=0; p<width*height;p++ ){
            let r=data[ptr++]
            let g=data[ptr++]
            let b=data[ptr++]
            let hsv = this.Rgb2Hsv(r/255, g/255, b/255)
            hPixels[p]=hsv.h
            sPixels[p]=hsv.s
            vPixels[p]=hsv.v
        }
        return [hImg, sImg, vImg]    
    }

    /**
     * Generate a canvas from HSV components
     * @param hImg hue image. Float image, with values from 0 to 260
     * @param sImg saturation image. Float image with values from 0 to 1
     * @param vImg value image. Float image with values from 0 to 1
     */
    static fromHSV( hImg : ImageFloat32, sImg : ImageFloat32, vImg : ImageFloat32) : SeqCanvas {
        let width = hImg.width
        let height= hImg.height
        let canvas= { width, height, data : new Uint8Array(width*height*3)}
        let data = canvas.data
        let hPixels = hImg.imagePixels
        let sPixels = sImg.imagePixels
        let vPixels = vImg.imagePixels
        let ptr =0;
        for( let p=0; p<width*height; p++){
            let h = hPixels[p]
            let s = sPixels[p]
            let v = vPixels[p]
            let rgb = this.Hsv2Rgb(h,s,v)
            data[ptr++] = rgb.r * 255
            data[ptr++] = rgb.g * 255
            data[ptr++] = rgb.b * 255
        }
        return canvas
    }

    /**
     * convert the values in HSV coordinates
     * @param r red value in   [0,1.0]
     * @param g green value in [0,1.0]
     * @param b blue value in [0,1.0]
     */
    private static Rgb2Hsv( r: number, g : number, b: number  ) : { h: number, s: number, v: number } {
        // talen from https://stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
        let out = { h: 0, v:0, s: 0}
        let min = Math.min(r,g,b)
        let max = Math.max(r,g,b)
        let delta = max-min
        out.v = max;
        if ( delta < 0.00001) {
            out.h =0
            out.s =0
        } else {
            assert(max > 0)
            out.s = delta/max
            if( r === max ) out.h = 0 + (g-b)/delta
            if( g === max ) out.h = 2 + (b-r)/delta
            if( b === max ) out.h = 4 + (r-g)/delta
        }

        out.h *= 60 // in degrees
        if( out.h < 0 ) out.h += 360

        assert(out.h >=0, `invalid hue ${out.h} with (${r},${g},${b})`)
        assert(out.s >=0, `invalid sat ${out.s} with (${r},${g},${b})`)
        assert(out.v >=0, `invalid val ${out.v} with (${r},${g},${b})`)
        assert(out.h <=360, `invalid hue ${out.h} with (${r},${g},${b})`)
        assert(out.s <=1.0, `invalid sat ${out.s} with (${r},${g},${b})`)
        assert(out.v <=1.0, `invalid val ${out.v} with (${r},${g},${b})`)

        return out
    }

    private static Hsv2Rgb(h:number, s:number, v:number) : {r:number, g:number, b:number} {
        // from https://stackoverflow.com/questions/3018313/algorithm-to-convert-rgb-to-hsv-and-hsv-to-rgb-in-range-0-255-for-both
        let out = { r:v, g:v, b:v}
        if( s > 0 ){
            assert(h <= 360)
            let hh = h / 60
            let region = Math.floor(hh)
            let reminder = hh - region
            let p = v * ( 1- s )
            let q = v * ( 1- (s * reminder))
            let t = v * ( 1- (s * (1 - reminder)))
            switch( region ){
                case 0: 
                    out.r = v
                    out.g = t
                    out.b = p
                    break;
                case 1:
                    out.r = q
                    out.g = v
                    out.b = p
                    break;
                case 2:
                    out.r = p
                    out.g = v
                    out.b = t
                    break
                case 3:
                    out.r = p
                    out.g = q
                    out.b = v
                    break
                case 4:
                    out.r = t
                    out.g = p
                    out.b = v
                    break
                default:
                    out.r = v
                    out.g = p
                    out.b = q
            }
        }

        assert(out.r >=0, `invalid red ${out.r} for (${h},${s},${v})`)
        assert(out.g >=0, `invalid green ${out.g} for (${h},${s},${v})`)
        assert(out.b >=0, `invalid blue ${out.b} for (${h},${s},${v})`)
        assert(out.r <=256, `invalid red ${out.r} for (${h},${s},${v})`)
        assert(out.g <=256, `invalid green ${out.g} for (${h},${s},${v})`)
        assert(out.b <=256, `invalid blue ${out.b} for (${h},${s},${v})`)

        return out
    }

    /**
     * convert the input canvas, assumed to be un RGB space, in to LAB
     * components using Observer= 2°, Illuminant= D65
     * @param image input image
     */
    static toLab(image : SeqCanvas ) : [ ImageFloat32, ImageFloat32, ImageFloat32] {
        let width = image.width
        let height= image.height
        let lImg= ImageFactory.Float32(width,height)
        let aImg= ImageFactory.Float32(width,height) 
        let bImg= ImageFactory.Float32(width,height) 
        let lPixels= lImg.imagePixels
        let aPixels= aImg.imagePixels
        let bPixels= bImg.imagePixels
        let data= image.data
        let ptr =0
        for(let p=0; p<width*height;p++ ){
            let r=data[ptr++]
            let g=data[ptr++]
            let b=data[ptr++]
            let lab = this.Rgb2Lab(r/255, g/255, b/255)
            lPixels[p]=lab.l
            aPixels[p]=lab.a
            bPixels[p]=lab.b
        }
        return [lImg, aImg, bImg]    
    }

    static fromLab( lImg : ImageFloat32, aImg : ImageFloat32, bImg : ImageFloat32) : SeqCanvas {
        let width = lImg.width
        let height= lImg.height
        let canvas= { width, height, data : new Uint8Array(width*height*3)}
        let data = canvas.data
        let lPixels = lImg.imagePixels
        let aPixels = aImg.imagePixels
        let bPixels = bImg.imagePixels
        let ptr =0;
        for( let p=0; p<width*height; p++){
            let l = lPixels[p]
            let a = aPixels[p]
            let b = bPixels[p]
            let rgb = this.Lab2Rgb(l,a,b)
            data[ptr++] = rgb.r * 255
            data[ptr++] = rgb.g * 255
            data[ptr++] = rgb.b * 255
        }
        return canvas
    }
    
    // Taken from https://github.com/antimatter15/rgb-lab/blob/master/color.js
    // which in turns is taken from the heavily referenced web site :
    // https://www.easyrgb.com/en/math.php
    static Rgb2Lab(r: number, g: number, b: number) : { l: number, a:number, b:number } {
  
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    
        x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    
        return { l : (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) }
    }
    static Lab2Rgb(l: number, a: number, b: number) {
        let y = (l + 16) / 116
        let x = a / 500 + y
        let z = y - b / 200
  
        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

        let rgb = {
            r : x *  3.2406 + y * -1.5372 + z * -0.4986,
            g : x * -0.9689 + y *  1.8758 + z *  0.0415,
            b : x *  0.0557 + y * -0.2040 + z *  1.0570
        }
    
        rgb.r = (rgb.r > 0.0031308) ? (1.055 * Math.pow(rgb.r, 1/2.4) - 0.055) : 12.92 * rgb.r;
        rgb.g = (rgb.g > 0.0031308) ? (1.055 * Math.pow(rgb.g, 1/2.4) - 0.055) : 12.92 * rgb.g;
        rgb.b = (rgb.b > 0.0031308) ? (1.055 * Math.pow(rgb.b, 1/2.4) - 0.055) : 12.92 * rgb.b;

        rgb.r = Math.max(0, Math.min(1,rgb.r))
        rgb.g = Math.max(0, Math.min(1,rgb.g))
        rgb.b = Math.max(0, Math.min(1,rgb.b))

        return rgb
    }

}