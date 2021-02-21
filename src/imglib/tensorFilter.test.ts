
import { getCanvases, hash, dumpCanvas, toSeqCanvas, dumpImage, overlayTensor, overlayTangent } from './testutils'
import {ImageFloat32} from './imagebase'
import CanvasUtils from './canvasUtils'
import TensorFilter from './tensorFilter'

test('shall smooth the image preserving edges',async()=>{
  
    for await ( const [canvas,ctx,name] of getCanvases() ) {
        let [lImg] = CanvasUtils.toLab(toSeqCanvas(canvas))
        let max = lImg.maxValue()
        let min = lImg.minValue()
        let scale = 254 / (max-min)
        let offset= -min*scale
        lImg = lImg.convertTo('Float32',scale,offset) as ImageFloat32

        const nIterations = 3

        //dumpImage(lImg,`image ${name}`)
        let fImage = lImg

        for( let i=0; i< nIterations; i++){
            fImage = TensorFilter.Run(fImage, 1) as ImageFloat32
            //dumpImage(fImage,`image ${name} t filter ${i}`)
            let hsh = await hash(fImage)
            expect(hash).toMatchSnapshot()
        }
        
    }
},5*60*1000)