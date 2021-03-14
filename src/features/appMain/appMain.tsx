import React, {useState, useCallback, useEffect} from 'react'
import  { useDropzone } from "react-dropzone"
import { FileWithPath } from "file-selector";
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Typography from '@material-ui/core/Typography';
import AppDisplay from './appDisplay'
import { useDispatch, useSelector } from 'react-redux';
import { selecUpload, setUpload } from './uploadSlice';

const useStyles = makeStyles((theme) => ({
    root: {
            width:'100%',
            height:'100%',
            padding:'4px'
        },
        drop :{
            width:'100%',
            height:'100%',
            borderWidth:'2px',
            borderStyle: 'dotted',
            borderColor: theme.palette.primary.light,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            "&:hover": {
                borderColor: theme.palette.primary.dark
              },
            "& .AddIcn" :{
                fontSize:80,
                color: theme.palette.primary.light
            },
            "&:hover .AddIcn" :{
                fontSize:80,
                color: theme.palette.primary.dark
            },
            "& .text" :{
            textAlign:'center',
            color:theme.palette.primary.light 
            },
            "&:hover .text" :{
                textAlign:'center',
                color:theme.palette.primary.dark 
            }
        },
        noDisplay : {
            display:'none'
        }
    }))

    const imageExtensions = ['.jpg','.png','.jpeg']

    export default function AppMain(){
        const upload = useSelector(selecUpload)
        const dispatch= useDispatch()
        const classes = useStyles();
        const [file, setFile] = useState<string|null>(null)
        const onDrop = useCallback((files: FileWithPath[]) => {
            let list = files.filter((file)=>imageExtensions.some((ext)=>file.path?.toLowerCase().endsWith(ext)))
            if( list.length > 0 ) {
                let path = URL.createObjectURL(list[0])
                setFile(path)
                dispatch(setUpload(false))
            }
        }, [setFile])
        const {getRootProps, getInputProps, open, isDragActive} = useDropzone({onDrop})

        useEffect(()=>{
            if( upload ){
                open()
            }
        },[open, upload])
    
        return (
            <div className={classes.root}>
                    <div {...getRootProps()} className={classes.root}>
                            <div className={ isDragActive ? classes.drop : classes.noDisplay}>
                                <ArrowDownwardIcon className="AddIcn"/>
                                <Typography className="text">Drop the images here.</Typography>
                            </div> 
                            {
                                file !== null && !upload ?
                                <>
                                    <AppDisplay imagePath={file} />
                                </> :
                                <div className={classes.drop}>
                                    <input {...getInputProps()} />
                                    <AddIcon className="AddIcn"/>
                                    <Typography className="text">Drag and Drop here your image.</Typography>
                                    <Typography className="text">or click here to select the image to view.</Typography>
                                </div> 
                            }
                    </div>
            </div>
        )
    }
