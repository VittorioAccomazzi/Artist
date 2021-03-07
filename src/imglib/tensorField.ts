import {ImageFactory, Image2D, ImageFloat32} from './imagebase'

export interface tensor {
    majVec : [number, number], // major eigenvector
    minVec : [number, number], // minor eigenvector
    majVal : number, // major eigenvalue
    minVal : number  // minor eigenvalue
}

export const zeroTensor : tensor = {
    majVec : [0,0],
    minVec : [0,0],
    majVal : 0,
    minVal : 0
}

export default class TensorField {

    private tensors : tensor []
    private nx : number 

    constructor( tensors : tensor [], nx : number ) {
        this.tensors = tensors
        this.nx = nx
    }

    /**
     * width of the field
     */
    get width() : number {
        return this.nx
    }

    /**
     * height of the field
     */
    get height() : number {
        return this.tensors.length/this.nx
    }

    /**
     *  get a tensor in the position x,y
     * @param x x position
     * @param y y position
     */
    get( x: number, y : number ) : tensor {
        if(!this.checkBoundary(x,y)) throw(Error(`invalid tensor position ${x},${y} field size ${this.width},${this.height}`))
        return this.tensors[y*this.nx+x]
    }

    /**
     * return the field tensors as flat array row major
     */
    get fieldTensors() : tensor [] {
        return this.tensors
    }

    private checkBoundary(x: number, y : number) : boolean {
        return x>=0 && y>=0 && x <this.width && y<this.height
    }

}
