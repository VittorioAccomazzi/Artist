import {hash, getCanvases, toHTMLCanvas, toNodeCanvas, dumpImage} from './testutils'
import {ImageFactory} from './imagebase'
import CanvasUtils from './canvasUtils'
import Gradient from './gradient'

test('shall generate correct gradients', async ()=>{
    let width = 12
    let height= 11
    let image = ImageFactory.Uint8(width,height)
    let size = 5
    let xStart = Math.floor((width-size)/2)
    let yStart = Math.floor((height-size)/2)
    for( let y=0; y<size; y++){
        for( let x=0; x<size; x++ ){
            image.set(xStart+x, yStart+y, 1)
        }
    }
    let grad = new Gradient(image)

    expect(grad.width).toBe(width)
    expect(grad.height).toBe(height)

    let grad15 = grad.gradient(1,5)
    expect(grad15[0]).toBe(0)
    expect(grad15[1]).toBe(0)

    let grad35 = grad.gradient(3,5)
    expect(grad35[0]).toBe(0)
    expect(grad35[1]).toBe(4)

    let grad51 = grad.gradient(5,2)
    expect(grad51[0]).toBe(4)
    expect(grad51[1]).toBe(0)

    let grad85 = grad.gradient(8,5)
    expect(grad85[0]).toBe(0)
    expect(grad85[1]).toBe(-4)

    let grad58 = grad.gradient(5,8)
    expect(grad58[0]).toBe(-4)
    expect(grad58[1]).toBe(0)

    let grad33 = grad.gradient(3,3)
    expect(grad33[0]).toBe(3)
    expect(grad33[1]).toBe(3)

    let grad73 = grad.gradient(7,3)
    expect(grad73[0]).toBe(3)
    expect(grad73[1]).toBe(-3)

    let grad77 = grad.gradient(7,7)
    expect(grad77[0]).toBe(-3)
    expect(grad77[1]).toBe(-3)

    let grad37 = grad.gradient(3,7)
    expect(grad37[0]).toBe(-3)
    expect(grad37[1]).toBe(3)

    let grad55 = grad.gradient(5,5)
    expect(grad55[0]).toBe(0)
    expect(grad55[1]).toBe(0)

})

test('shall throw on invalid coordinate',()=>{
    let width = 12
    let height= 11
    let image = ImageFactory.Uint8(width,height)
    let grad = new Gradient(image)

    expect(()=>{
        let a = grad.gradient(-1,0)
    }).toThrow()

    expect(()=>{
        let a = grad.gradient(101,0)
    }).toThrow()

    expect(()=>{
        let a = grad.gradient(2,-5)
    }).toThrow()

    expect(()=>{
        let a = grad.gradient(2,50)
    }).toThrow()
})