import TensorField, { tensor, zeroTensor} from './tensorField'

test('shall return with and height ad tesnors',()=>{
    let tensors : tensor[] = Array<tensor>(20).fill(zeroTensor).map((v,i)=>({ ...zeroTensor, majVal:i }))
    let tField = new TensorField(tensors,5)

    expect(tField.width).toBe(5)
    expect(tField.height).toBe(4)
    
    let t = tField.get(4,1)
    expect(t).toStrictEqual({...zeroTensor, majVal:9})

    expect(()=>{
        let tt = tField.get(-2, 2)
    }).toThrow()

    expect(tField.fieldTensors.length).toBe(tensors.length)
})

