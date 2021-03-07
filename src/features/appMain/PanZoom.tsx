import React from 'react';
import {useRef} from 'react'
import usePanZoom from '../../uselib/usePanZoom'
import useCenterPos from '../../uselib/useCenterPos'
import {makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    mainDiv: {
        width:'100%',
        height:'100%',
        touchAction:'none',
        overflow:'hidden'
    }
}))

export interface PanZoomInfo {
    children: React.ReactNode,
    filename: string
}
export default function PanZoom({children, filename} : PanZoomInfo) : JSX.Element {
    const classes  = useStyles()
    const mainDiv  = useRef<HTMLDivElement|null>(null)
    const contDiv  = useRef<HTMLDivElement|null>(null) 

    let pzMatrix = usePanZoom(mainDiv,[filename])
    let cpMatrix = useCenterPos(contDiv, mainDiv, [children])
    cpMatrix.preMultiplySelf(pzMatrix)

    return ( 
        <div className={classes.mainDiv} ref={mainDiv}>
            <div style={{position: 'relative', transformOrigin: '0px 0px', transform: cpMatrix.toString(), width: 'fit-content', height: 'fit-content' }} ref={contDiv}>
                {children}
            </div>
        </div>
     )
}