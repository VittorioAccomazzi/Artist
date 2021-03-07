import React from 'react'
import { useDispatch } from 'react-redux'
import ToolButton from './toolButton'
import GetAppIcon from '@material-ui/icons/GetApp'
import { setDownload } from '../appMain/downloadSlice'


export default function DownloadTool( ) {
    const dispatch   = useDispatch()
    const onClick    = () => dispatch(setDownload(true))
    return (
        <ToolButton onClick={onClick} Icon={GetAppIcon} isSelected={false}/>
    )
}