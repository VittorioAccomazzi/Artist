import React from 'react'
import { SvgIconTypeMap } from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { useDispatch, useSelector } from 'react-redux'
import { PainterType, selectPainter, setPainter } from '../appMain/appWorker/painterSlice'
import ToolButton from './toolButton'
import BrushIcon from '@material-ui/icons/Brush'
import FormatPaintIcon from '@material-ui/icons/FormatPaint'

export function BilateralPainter () {
    return <PainterTool Icon={BrushIcon} type={PainterType.Bilateral}/>
}

export function TensorPainter () {
    return <PainterTool Icon={FormatPaintIcon} type={PainterType.Tensor}/>  
}

type PainterToolInfo = {
    Icon : OverridableComponent<SvgIconTypeMap<{}, "svg">>,
    type : PainterType
}
function PainterTool( {Icon, type}: PainterToolInfo) {
    const selPainter =  useSelector(selectPainter)
    const isSelected = selPainter == type
    const dispatch   = useDispatch()
    const onClick    = () => dispatch(setPainter(type))
    return (
        <ToolButton onClick={onClick} Icon={Icon} isSelected={isSelected}/>
    )
}
