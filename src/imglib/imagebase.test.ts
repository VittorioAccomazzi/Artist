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

test('Shall support parametric generation of image with different types',()=>{
    let img8 = ImageFactory.Image('Uint8',2,2)
    expect(img8.imageType).toBe('Uint8')
    let img16 = ImageFactory.Image('Uint16',2,2)
    expect(img16.imageType).toBe('Uint16')
    let img32 = ImageFactory.Image('Float32',2,2)
    expect(img32.imageType).toBe('Float32')
})

test('shall support image conversion',()=>{
    let width =5
    let height=3
    let img8 = ImageFactory.Uint8(width, height)
    let x=2;
    let y=1
    let v=124
    img8.set(x,y,v)

    let img16 = img8.convertTo('Uint16')
    expect(img16.get(x,y)).toBe(v)

    img16 = img8.convertTo('Uint16', 2, 1)
    expect(img16.get(x,y)).toBe(2*v+1)

    let img32 = img8.convertTo('Float32')
    expect(img32.get(x,y)).toBe(v)

    img32 = img8.convertTo('Float32', -2, 2)
    expect(img32.get(x,y)).toBe(-2*v+2)

})

test('shall support image conversion',()=>{
    let width =5
    let height=3
    let img32 = ImageFactory.Float32(width, height)
    let x=2;
    let y=1
    let v=-124
    img32.set(x,y,v)

    let img16 = img32.convertTo('Uint16')
    expect(img16.get(x,y)).toBe(65412) // ❗️ this is important and we need to be aware of this. No clamping

    img16 = img32.convertTo('Uint16', -2, 1)
    expect(img16.get(x,y)).toBe(-2*v+1)

    let img8 = img32.convertTo('Uint8')
    expect(img8.get(x,y)).toBe(132) //❗️ same here. Need to be aware of wrapping around.

    img8 = img32.convertTo('Uint8', -1, 0)
    expect(img8.get(x,y)).toBe(-v+0)

})

test('shall allow to copy an image',()=>{
    let width =5
    let height=3
    let image = ImageFactory.Uint8(width, height)
    let x=2;
    let y=1
    let v=124
    image.set(x,y,v)

    let copy = image.convertTo(image.imageType)

    let srcPixels = image.imagePixels;
    let dstPixels = copy.imagePixels;

    let diff = srcPixels.map((v,i)=>v-dstPixels[i])

    let max = diff.reduce((m,v)=>Math.max(v,m), 0)

    expect(max).toBe(0)

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

test('shall return max and min pixel values',()=>{
    let width =7
    let height=12
    let img16 = ImageFactory.Uint16(width, height)
    img16.set(3,3,5)
    img16.set(3,5,18)
    expect(img16.minValue()).toBe(0)
    expect(img16.maxValue()).toBe(18)
    let img32 = ImageFactory.Float32(width, height)
    img32.set(3,3,-5)
    img32.set(3,5,18.3)
    expect(img32.minValue()).toBeCloseTo(-5)
    expect(img32.maxValue()).toBeCloseTo(18.3)
    
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