import React from 'react'
import { useDispatch } from 'react-redux'
import ToolButton from './toolButton'
import PublishIcon from '@material-ui/icons/Publish';
import { setUpload } from '../appMain/uploadSlice'


export default function UploadTool( ) {
    const dispatch   = useDispatch()
    const onClick    = () => dispatch(setUpload(true))
    return (
        <ToolButton onClick={onClick} Icon={PublishIcon} isSelected={false}/>
    )
}