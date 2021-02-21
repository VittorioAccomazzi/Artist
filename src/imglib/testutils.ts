import { Canvas, createCanvas, loadImage } from 'canvas';
import {Image2D, ImageUint8, isImage} from './imagebase'
import Histogram from './histogram'
import CanvasUtils, {SeqCanvas} from './canvasUtils'
import {imageHash} from 'image-hash'
import * as fs from 'fs'
import * as path from 'path'
import TensorField from './tensorField';


export const tmpFolder = 'tmp'
export const testImage1 = 'src/imglib/testimages/test1.jpg'
export const testImage2 = 'src/imglib/testimages/test2.jpg'
export const testImages = [ testImage1, testImage2]

export async function hash( image : Canvas | Image2D ) : Promise<string> {
    let canvas =  isImage(image) ? toCanvas(image) : image
    let b = canvas.toBuffer('image/png');
    let name = `testImage-${canvas.width}x${canvas.height}.png`
    return new Promise((res, rej)=>{
        imageHash({
            ext: 'image/png',
            data: b,
            name: name
        }, 128, true, (err: Error, val : string )=>{
            if( err ) rej(err)
            res(val)
        })
    })
}

export async function* getCanvases() : AsyncGenerator<[Canvas, CanvasRenderingContext2D, string]>{
    for( let img of testImages) {
        let image = await loadImage(img)
        let canvas= createCanvas(image.width, image.height);
        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        yield [canvas, ctx, path.basename(img,'.jpg')]
    }
}

export function toCanvas(image : Image2D) : Canvas {
    let max = image.maxValue()
    let min = image.minValue()
    let img = image

    if ( max > 255 || min <0 ){
        // no need to convert
        let range = max - min
        let scale = range > 0 ? 254/range : 1
        scale = Math.min(1, scale) // to not scale up.
        let offset = -scale * min
        img = image.convertTo('Uint8', scale, offset)
    }  
    let width = img.width
    let height= img.height
    let canvas= createCanvas(width, height)
    let ctx = canvas.getContext('2d')
    let data = ctx.getImageData(0,0, width, height)
    let pixels= img.imagePixels
    let ptr =0
    for(let y=0; y<height; y++){
        let yOffset = y*width
        for( let x=0; x<width; x++){
            let p = Math.floor(pixels[yOffset+x])
            data.data[ptr++] = p // Red
            data.data[ptr++] = p // Green
            data.data[ptr++] = p // blue
            data.data[ptr++] = 255 // alpha
        }
    }
    ctx.putImageData(data,0,0)
    return canvas
}

export async function dumpImage( image : Image2D, name? : string ){
    let nCanvas = toCanvas(image)
    dumpCanvas(nCanvas,name)
}

export async function dumpCanvas(canvas : Canvas, name? : string ) : Promise<void> {
    let fullname = path.resolve(tmpFolder, name ? name: (await hash(canvas)).substr(0,25))
    if( ! fs.existsSync(tmpFolder)){
        fs.mkdirSync(tmpFolder)
    }
    await saveCanvas(canvas, fullname)
}

export function toSeqCanvas( nCanvas : Canvas ) : SeqCanvas {
    // this is inefficient, but allows to test more code
    let hCanvas = toHTMLCanvas(nCanvas)
    return CanvasUtils.toSeq(hCanvas)
}

export function toHTMLCanvas(nCanvas : Canvas) : HTMLCanvasElement {
    let hCanvas = document.createElement('canvas')
    hCanvas.width = nCanvas.width
    hCanvas.height= nCanvas.height
    let hCtx = hCanvas.getContext('2d')
    let nCtx = nCanvas.getContext('2d')
    let nDat = nCtx.getImageData(0,0,nCanvas.width,nCanvas.height)
    hCtx?.putImageData(nDat, 0, 0)
    return hCanvas
}

export function toNodeCanvas(inCanvas : HTMLCanvasElement | SeqCanvas ) : Canvas {
    let nCanvas = null
    if( isSeqCanvas (inCanvas)  ) {
        // this is more inefficient, but allows to test more code
        let hCanvas =  document.createElement('canvas')
        CanvasUtils.fromSeq(inCanvas,hCanvas)
        nCanvas = toNodeCanvas(hCanvas)
    } else {
        nCanvas = createCanvas(inCanvas.width,inCanvas.height)
        let nCtx = nCanvas.getContext('2d')
        let hCtx = inCanvas.getContext('2d') as CanvasRenderingContext2D
        let hDat = hCtx.getImageData(0,0,nCanvas.width,nCanvas.height) 
        nCtx?.putImageData(hDat, 0, 0) 
    }
    return nCanvas
}

function isSeqCanvas(obj : any ) : obj is SeqCanvas {
    return obj.data != null && obj.width != null && obj.height != null && obj.data.length > 0 
}

async function saveCanvas( canvas : Canvas, filename : string ) : Promise<void>{
    return new Promise( (res,rej)=>{
        const out = fs.createWriteStream(`${filename}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  res())
    })
}

const maxHeight = 512
export  function displayHisto(histo : Histogram , cMap? : string []) : Canvas {
    let maxVal= histo.maxValue
    let bins  = histo.histogramBins
    let scale = Math.min( 1, maxHeight/maxVal)
    let width = bins.length
    let height= Math.floor(scale*maxVal)
    let canvas = createCanvas(width,height)
    let ctx = canvas.getContext('2d')
    ctx.fillStyle="#FFFFFFFF"
    ctx.fillRect(0,0,width,height)
    bins.forEach((v,i)=>{
        let col =  cMap ? cMap[i] : "#0000FFFF"
        ctx.beginPath()
        ctx.strokeStyle= col
        let scaled = Math.floor(v * scale)
        ctx.moveTo(i,height)
        ctx.lineTo(i,height-scaled)
        ctx.stroke()
    })
    return canvas
}

const randomCoords =' \
0.182	0.941	0.731	0.569	0.690	0.887	0.988	0.130   \
0.665	0.971	0.741	0.356	0.132	0.871	0.199	0.852   \
0.393	0.612	0.458	0.677	0.426	0.649	0.814	0.373   \
0.088	0.010	0.415	0.751	0.443	0.397	0.114	0.819   \
0.300	0.507	0.321	0.202	0.081	0.114	0.656	0.116   \
0.655	0.552	0.956	0.870	0.602	0.876	0.297	0.394   \
0.831	0.566	0.352	0.252	0.356	0.297	0.972	0.810   \
0.954	0.567	0.747	0.723	0.190	0.377	0.634	0.655   \
0.931	0.617	0.787	0.653	0.491	0.509	0.751	0.276   \
0.474	0.509	0.082	0.354	0.334	0.315	0.600	0.204   \
0.413	0.280	0.968	0.293	0.247	0.138	0.471	0.230   \
0.246	0.304	0.398	0.871	0.548	0.626	0.963	0.870   \
0.289	0.193	0.042	0.250	0.617	0.441	0.248	0.332   \
0.988	0.192	0.079	0.742	0.387	0.047	0.848	0.266   \
0.979	0.289	0.349	0.271	0.452	0.182	0.614	0.361   \
0.909	0.262	0.522	0.650	0.810	0.561	0.340	0.873   \
0.622	0.441	0.154	0.277	0.044	0.247	0.002	0.769   \
0.230	0.449	0.075	0.155	0.189	0.224	0.463	0.439   \
0.583	0.834	0.544	0.728	0.853	0.866	0.160	0.762   \
0.362	0.661	0.310	0.225	0.009	0.024	0.125	0.443   \
0.003	0.834	0.899	0.645	0.552	0.914	0.985	0.627   \
0.889	0.236	0.633	0.534	0.710	0.270	0.355	0.654   \
0.554	0.631	0.507	0.675	0.252	0.523	0.685	0.112   \
0.668	0.934	0.304	0.334	0.426	0.322	0.486	0.861   \
0.215	0.286	0.680	0.632	0.348	0.359	0.807	0.131   \
0.583	0.622	0.664	0.878	0.552	0.704	0.928	0.528   \
0.001	0.912	0.560	0.657	0.547	0.655	0.057	0.961   \
0.373	0.535	0.322	0.108	0.290	0.313	0.951	0.939   \
0.163	0.243	0.874	0.724	0.401	0.894	0.203	0.074   \
0.687	0.443	0.736	0.987	0.984	0.047	0.465	0.488   \
0.605	0.581	0.194	0.778	0.514	0.221	0.096	0.622   \
0.664	0.553	0.350	0.868	0.690	0.141	0.263	0.435   \
0.377	0.611	0.680	0.095	0.228	0.614	0.997	0.587   \
0.149	0.452	0.598	0.396	0.802	0.871	0.450	0.143   \
0.459	0.312	0.525	0.360	0.440	0.291	0.378	0.277   \
0.539	0.152	0.078	0.890	0.845	0.319	0.278	0.545   \
0.500	0.822	0.785	0.052	0.109	0.243	0.753	0.090   \
0.853	0.479	0.345	0.408	0.968	0.503	0.943	0.052   \
0.434	0.363	0.487	0.367	0.479	0.090	0.281	0.032   \
0.983	0.981	0.227	0.562	0.381	0.816	0.492	0.046   \
0.063	0.390	0.640	0.683	0.298	0.108	0.448	0.359   \
0.232	0.360	0.755	0.615	0.230	0.933	0.462	0.079   \
0.090	0.096	0.188	0.801	0.653	0.007	0.499	0.408   \
0.849	0.722	0.376	0.007	0.023	0.099	0.365	0.859   \
0.220	0.974	0.740	0.871	0.904	0.137	0.176	0.010   \
0.514	0.418	0.316	0.837	0.812	0.901	0.109	0.365   \
0.059	0.838	0.715	0.713	0.695	0.447	0.472	0.824   \
0.966	0.626	0.627	0.004	0.484	0.982	0.467	0.768   \
0.207	0.136	0.007	0.864	0.891	0.260	0.579	0.711   \
0.222	0.614	0.675	0.816	0.910	0.375	0.726	0.952   \
0.876	0.111	0.097	0.757	0.808	0.200	0.815	0.059   \
0.584	0.954	0.431	0.643	0.678	0.810	0.452	0.272   \
0.374	0.649	0.218	0.183	0.042	0.489	0.041	0.660   \
0.237	0.243	0.917	0.807	0.357	0.626	0.634	0.104   \
0.800	0.295	0.267	0.704	0.111	0.078	0.156	0.519   \
0.541	0.288	0.983	0.200	0.362	0.293	0.862	0.669   \
0.605	0.348	0.742	0.607	0.786	0.393	0.168	0.011   \
0.542	0.088	0.007	0.512	0.529	0.143	0.044	0.976   \
0.686	0.991	0.930	0.025	0.873	0.494	0.383	0.671   \
0.595	0.537	0.092	0.415	0.561	0.083	0.596	0.916   \
0.477	0.048	0.566	0.999	0.885	0.639	0.131	0.963   \
0.749	0.621	0.469	0.631	0.787	0.462	0.584	0.316   \
0.442	0.690	0.800	0.099	0.822	0.580	0.350	0.936   \
0.316	0.766	0.889	0.701	0.948	0.368	0.837	0.725   \
0.254	0.185	0.222	0.407	0.203	0.034	0.288	0.128   \
0.429	0.893	0.456	0.439	0.150	0.521	0.937	0.087   \
0.578	0.398	0.266	0.978	0.200	0.153	0.392	0.829   \
0.828	0.418	0.224	0.508	0.792	0.040	0.750	0.154   \
0.852	0.597	0.771	0.553	0.206	0.319	0.993	0.745   \
0.488	0.691	0.666	0.376	0.077	0.782	0.665	0.297   \
0.311	0.560	0.534	0.090	0.547	0.423	0.989	0.206   \
0.478	0.726	0.216	0.581	0.207	0.280	0.313	0.414   \
0.717	0.346	0.101	0.831	0.483	0.362	0.118	0.454   \
0.258	0.419	0.180	0.476	0.346	0.370	0.827	0.506   \
0.426	0.555	0.030	0.026	0.340	0.536	0.062	0.372   \
0.241	0.185	0.901	0.837	0.608	0.027	0.417	0.306   \
0.503	0.002	0.247	0.440	0.160	0.833	0.910	0.709   \
0.631	0.501	0.163	0.369	0.931	0.970	0.331	0.871   \
0.814	0.939	0.707	0.060	0.148	0.410	0.476	0.706   \
0.963	0.374	0.794	0.520	0.288	0.800	0.482	0.136   \
0.441	0.909	0.254	0.753	0.298	0.694	0.122	0.067   \
0.177	0.757	0.921	0.537	0.165	0.153	0.674	0.262   \
0.090	0.986	0.387	0.699	0.834	0.243	0.524	0.081   \
0.577	0.468	0.059	0.889	0.977	0.076	0.503	0.451   \
0.372	0.767	0.806	0.663	0.398	0.272	0.065	0.532   \
0.604	0.355	0.141	0.054	0.464	0.162	0.819	0.693   \
0.580	0.339	0.118	0.261	0.265	0.381	0.313	0.755   \
0.463	0.876	0.069	0.831	0.463	0.958	0.329	0.209   \
0.961	0.618	0.510	0.987	0.403	0.813	0.503	0.735   \
0.646	0.540	0.166	0.058	0.269	0.633	0.393	0.448   \
0.555	0.772	0.774	0.107	0.483	0.442	0.716	0.130   \
0.317	0.616	0.500	0.335	0.822	0.697	0.381	0.290   \
0.238	0.514	0.396	0.147	0.347	0.588	0.642	0.319   \
0.718	0.092	0.296	0.188	0.232	0.528	0.353	0.980   \
0.357	0.872	0.159	0.737	0.180	0.799	0.696	0.831   \
0.750	0.381	0.483	0.659	0.674	0.322	0.130	0.554   \
0.648	0.435	0.721	0.519	0.295	0.860	0.296	0.952   \
0.035	0.035	0.994	0.023	0.454	0.635	0.850	0.442   \
0.144	0.017	0.732	0.414	0.810	0.848	0.412	0.303   \
0.749	0.463	0.725	0.292	0.428	0.269	0.761	0.668   \
'

/**
 * return a list of number from 0 to 1 distribuited randomly.
 * it provies the same list at each run for consistency in the
 * tests
 */
export function randomNumber() : number [] {
    let vals = randomCoords.split(/[\t\s]+/)
    let numbers : number [] = []
    vals.forEach((v)=> v.trim() != '' ? numbers.push(parseFloat(v)) : null )
    return numbers
}

/**
 * generate a lits of random points on the width, height range.
 * The pointts are generte in interger coordinates.
 * @param width range of the x coordinates
 * @param height range of the y coordinates
 */
export function randomPoints( width : number, height : number ) : {x:number, y:number } [] {
    let vals = randomNumber();
    let points : {x:number, y:number } [] = []
    for( let i=0; i<Math.floor(vals.length/2); i++ ){
        let x = Math.floor( vals[2*i] * width )
        let y = Math.floor( vals[2*i+1] * height )
        points.push({x,y})
    }
    return points
}

export function overlayTensor( canvas : Canvas, tf : TensorField, size : number =2 ) : Canvas {
    let mag = 2*size+1
    let width = canvas.width
    let height= canvas.height
    let outCanvas = createCanvas(width*mag, height*mag)

    // normalize the tensor field
    let maxEgVal = tf.fieldTensors.reduce((m,v)=>Math.max(m,v.majVal),0)
    let rThr = maxEgVal * 2/3 // red threshold : top 30%
    let gThr = maxEgVal * 1/3 // greeen threshold : mid 30%
      // blue threshold is bottom 30%

    // drawing
    let ctx = outCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, width, height, 0, 0, outCanvas.width, outCanvas.height )

    let step = 2
    let mjLen = step*size

    for( let y=0; y<height; y+=step){
        for( let x=0; x<width; x+=step){
            let t = tf.get(x,y)
            let xPos = x*mag+size+1
            let yPos = y*mag+size+1
            let col = "#0000FF"
            if( t.majVal > gThr ) col = "#00FF00"
            if( t.majVal > rThr ) col = "#FF0000"
            let xMjS = xPos+t.majVec[0] * mjLen
            let yMjS = yPos+t.majVec[1] * mjLen
            let xMjE = xPos-t.majVec[0] * mjLen
            let yMjE = yPos-t.majVec[1] * mjLen

            ctx.beginPath()
            ctx.strokeStyle = col
            ctx.moveTo(xMjS,yMjS)
            ctx.lineTo(xMjE,yMjE)
            if( t.minVal > 0 ){
                let mnlen = Math.max( mjLen * t.minVal/t.majVal, 1 )
                let xMnS = xPos+t.minVec[0] * mnlen
                let yMnS = yPos+t.minVec[1] * mnlen
                let xMnE = xPos-t.minVec[0] * mnlen
                let yMnE = yPos-t.minVec[1] * mnlen     
                ctx.moveTo(xMnS,yMnS)
                ctx.lineTo(xMnE,yMnE)  
            }
            ctx.stroke()
        }
    }
    return outCanvas
}


export function overlayTangent( canvas : Canvas, tf : TensorField, size : number =2 ) : Canvas {
    let mag = 2*size+1
    let width = canvas.width
    let height= canvas.height
    let outCanvas = createCanvas(width*mag, height*mag)

    // normalize the tensor field
    let maxEgVal = tf.fieldTensors.reduce((m,v)=>Math.max(m,v.minVal),0)
    let rThr = maxEgVal * 2/3 // red threshold : top 30%
    let gThr = maxEgVal * 1/3 // greeen threshold : mid 30%
      // blue threshold is bottom 30%

    // drawing
    let ctx = outCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, width, height, 0, 0, outCanvas.width, outCanvas.height )

    let step = 2
    let mjLen = step*size

    for( let y=0; y<height; y+=step){
        for( let x=0; x<width; x+=step){
            let t = tf.get(x,y)
            let xPos = x*mag+size+1
            let yPos = y*mag+size+1
            let col = "#0000FF"
            if( t.majVal > gThr ) col = "#00FF00"
            if( t.majVal > rThr ) col = "#FF0000"
            if( t.minVal > 0 ){
                ctx.beginPath()
                ctx.strokeStyle = col
                let xMnS = xPos+t.minVec[0] * mjLen
                let yMnS = yPos+t.minVec[1] * mjLen
                let xMnE = xPos-t.minVec[0] * mjLen
                let yMnE = yPos-t.minVec[1] * mjLen     
                ctx.moveTo(xMnS,yMnS)
                ctx.lineTo(xMnE,yMnE)  
                ctx.stroke()
            }
        }
    }
    return outCanvas
}

export default {}