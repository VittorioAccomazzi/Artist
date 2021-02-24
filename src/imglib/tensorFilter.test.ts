
import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, overlayTensor, overlayTangent, toNodeCanvas } from './testutils'
import {ImageFloat32} from './imagebase'
import CanvasUtils from './canvasUtils'
import TensorFilter from './tensorFilter'

test('shall smooth the image preserving edges',async()=>{
  
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg, aImg, bImg ] = CanvasUtils.toLab(toSeqCanvas(canvas))

        const nIterations = 3

        //dumpCanvas(canvas, `image ${name}`)

        for( let i=0; i< nIterations; i++){
            [lImg, aImg, bImg ] = TensorFilter.Run(lImg, aImg, bImg , 1) as [ ImageFloat32, ImageFloat32, ImageFloat32]
            let image = toNodeCanvas(CanvasUtils.fromLab(lImg, aImg, bImg))
            //dumpCanvas(image,`image ${name} t filter ${i}`)

            let hsh = await hash(image)
            expect(hsh).toMatchSnapshot()
        }
        
    }
},5*60*1000)