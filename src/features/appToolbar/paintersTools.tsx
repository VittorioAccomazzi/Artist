import React from 'react'
import { SvgIconTypeMap } from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { useDispatch, useSelector } from 'react-redux'
import { PainterType, selectPainter, setPainter } from '../appMain/appWorker/painterSlice'
import ToolButton from './toolButton'
import BrushIcon from '@material-ui/icons/Brush'
import PaletteIcon from '@material-ui/icons/Palette';

export function BilateralPainter () {
    return <PainterTool Icon={PaletteIcon} type={PainterType.Bilateral}/>
}

export function TensorPainter () {
    return <PainterTool Icon={BrushIcon} type={PainterType.Tensor}/>  
}

type PainterToolInfo = {
    Icon : OverridableComponent<SvgIconTypeMap<{}, "svg">>,
    type : PainterType
}
function PainterTool( {Icon, type}: PainterToolInfo) {
    const selPainter =  useSelector(selectPainter)
    const isSelected = selPainter === type
    const dispatch   = useDispatch()
    const onClick    = () => dispatch(setPainter(type))
    return (
        <ToolButton onClick={onClick} Icon={Icon} isSelected={isSelected}/>
    )
}
