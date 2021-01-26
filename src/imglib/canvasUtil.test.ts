import {hash, getCanvases, toHTMLCanvas, toNodeCanvas, dumpImage} from './testutils'
import CanvasUtils from './canvasUtils'

fit('shall split and combine canvas in images',async ()=>{
    for await ( const [canvas1,] of getCanvases() ) {
        let hsh1 = await hash(canvas1)
        const [ r, g, b, a ] = CanvasUtils.Split( toHTMLCanvas(canvas1))
        let canvas2 = toNodeCanvas(CanvasUtils.Compose(r,g,b,a))
        let hsh2 = await hash(canvas2)
        expect(hsh1).toBe(hsh2)
        let canvas3 = toNodeCanvas(CanvasUtils.Compose(r,g,b))
        let hsh3 = await hash(canvas3)
        expect(hsh1).toBe(hsh3)
    }
})