import Painter from './painter'
import { dumpCanvas, getCanvases, toSeqCanvas, hash, toNodeCanvas } from '../../../imglib/testutils'
import {SeqCanvas} from '../../../imglib/canvasUtils'

test('Painter quality validation', async ()=>{
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let  sCanvas : SeqCanvas | null = toSeqCanvas(canvas)
        let painter = new Painter(sCanvas)
        let num =0

        do {
            let canvas = toNodeCanvas(sCanvas)
            //await dumpCanvas(canvas,`painter ${name} ${num}`)
            num ++
            let hsh = await hash(canvas)
            expect( hsh ).toMatchSnapshot()
            sCanvas = painter.next()
        } while(sCanvas)
    }
},60*60*1000)