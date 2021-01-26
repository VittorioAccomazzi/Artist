
import {ImageFactory} from './imagebase'

test('shall report correct image size',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)
    expect(image.height).toEqual(height)
    expect(image.width).toEqual(width)
})

test('shall allow to set and get pixel values', ()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)
    let x=2;
    let y=0
    let v=124
    image.set(x,y,v)
    expect(image.get(x,y)).toEqual(v)
})

test('shall throw on invalid coordinated',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)

    expect(()=>{
        let v = image.get(1, -1)
    }).toThrow()

    expect(()=>{
        image.set(-1, 2,0)
    }).toThrow()

    expect(()=>{
        image.getRow(-1)
    })

})

test('shall provide image buffer',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)
    let x=2;
    let y=1
    let v=124
    image.set(x,y,v)

    let pixels = new Uint16Array( image.imageBuffer )

    expect(pixels[y*width+x]).toEqual(124)
    expect(pixels[0]).toEqual(0)

})

test('shall provide access to pixel data row major',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)
    let x=2;
    let y=1
    let v=124
    image.set(x,y,v)
    
    let pixels = image.imagePixels;
    expect(pixels[y*width+x]).toBe(v)
    expect(pixels[0]).toBe(0)
    expect(pixels.length).toBe(width*height)
})

test('shall provide row buffer',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint16(width, height)
    let x=2;
    let y=1
    let v=124
    image.set(x,y,v)

    let rPixels = image.getRow(y)

    expect(rPixels[x]).toEqual(124)
    expect(rPixels[0]).toEqual(0)

})

test('shall support multiple type of pixel types',()=>{
    let u16 = ImageFactory.Uint16(2,2)
    let u8  = ImageFactory.Uint8(2,2)
    let f32 = ImageFactory.Float32(2,2)
    expect(u16.imageType).toBe('Uint16')
    expect(u8.imageType).toBe('Uint8')
    expect(f32.imageType).toBe('Float32')
})

test('shall support 8 bit array',()=>{
    let image = ImageFactory.Uint8(3,2)
    image.set(1,1,5)  
    expect(image.get(1,1)).toBe(5)
})

test('shall support float values',()=>{
    let image=ImageFactory.Float32(3,2)
    let val = -3.2
    image.set(1,1,val)
    expect(image.get(1,1)).toBeCloseTo(val, 5)
})