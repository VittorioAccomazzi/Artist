import {testImages,hash, getCanvases} from './testutils'
import {loadImage} from 'canvas'

test('test image shall be present', async ()=>{
    for( let img of testImages) {
        let c = await loadImage(img)
        expect(c).not.toBeNull()
    }
})

test('validate basline hash', async()=>{
    for await ( const [canvas,] of getCanvases() ) {
        let h = await hash(canvas)
        expect(h).toMatchSnapshot();
    }
})

test('validate hash', async()=>{
    for await ( const [canvas,ctx] of getCanvases() ) {
        let h1 = await hash(canvas)
        ctx.beginPath()
        ctx.strokeStyle="FF0A00"
        ctx.fillRect(canvas.width/2, canvas.height/2,20,20)
        ctx.stroke()
        let h2 = await hash(canvas)
        expect(h1).not.toEqual(h2)
    }
}) 
