import { Image2D, ImageFactory, ImageFloat32 } from './imagebase';


export default class LoGFilter {
    static Run( inImg : Image2D, sigma : number ) : ImageFloat32 {
        let kernel= this.generateKernel(sigma)
        return LoGFilter.applyKernel(inImg, kernel);
    }

    private static applyKernel(inImg: Image2D, kernel: number[][]) : ImageFloat32 {
        let width = inImg.width
        let height= inImg.height
        let ouImg = ImageFactory.Float32(width,height)
        let hKSize= (kernel.length-1)/2
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let wSum = 0;
                let vSum = 0;
                for (let i = -hKSize; i <= hKSize; i++) {
                    let y0 = y + i;
                    if (y0 >= 0 && y0 < height) {
                        for (let j = -hKSize; j <= hKSize; j++) {
                            let x0 = x + j;
                            if (x0 >= 0 && x0 < width) {
                                let weight = kernel[i + hKSize][j + hKSize];
                                wSum += weight;
                                vSum += inImg.get(x0, y0) * weight;
                            }
                        }
                    }
                }
                if ( Math.abs(wSum) > 0)  ouImg.set(x, y, vSum / wSum);
            }
        }
        return ouImg;
    }

    private static generateKernel( sigma : number ) : number [][] {
        let hKernel = Math.floor(4*sigma)
        let kernel = Array(2*hKernel+1).fill([]).map((v,y)=>{
            let y0=Math.abs(y-hKernel-1)
            return Array(2*hKernel+1).fill(0).map((v,x)=>{
                let x0= Math.abs(x-hKernel-1)
                let sigma2 =sigma*sigma
                let val = (y0*y0+x0*x0)/(2*sigma2)
                let weight = -(1/(Math.PI*sigma2*sigma2))*(1-val)*Math.exp(-val)
                return weight
            })
        })
        return kernel
    }

}