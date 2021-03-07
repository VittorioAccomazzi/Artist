import {hash, getCanvases} from './testutils'

test('validate basline hash', async()=>{
    for await ( const [canvas,] of getCanvases(true) ) {
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
