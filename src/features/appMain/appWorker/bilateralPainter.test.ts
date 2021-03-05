import BilateralPainter from './bilateralPainter'
import { dumpCanvas, getCanvases, toSeqCanvas, hash, toNodeCanvas } from '../../../imglib/testutils'
import {SeqCanvas} from '../../../imglib/canvasUtils'

test('Tensor Painter quality validation', async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases(true) ) {
        let  sCanvas : SeqCanvas | null = toSeqCanvas(canvas)
        let painter = new BilateralPainter(sCanvas)
        let num =0

        do {
            let canvas = toNodeCanvas(sCanvas)
            // await dumpCanvas(canvas,`Bilateral painter ${name} ${num}`)
            num ++
            let hsh = await hash(canvas)
            expect( hsh ).toMatchSnapshot()
            sCanvas = painter.nextImage()
        } while(sCanvas)
    }
},60*60*1000)