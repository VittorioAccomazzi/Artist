import React from 'react'
import { useSelector } from 'react-redux'
import { selectProgress } from '../appMain/progressSlice'
import { Box, CircularProgress, createStyles, makeStyles, Theme, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cirProgress: {
      marginRight: theme.spacing(2),
      color:'#0000FF',
    },
    txtProgress: {
        marginRight: theme.spacing(2),
        color:'#0000FF',
    }
  }),
);


export default function PainterProgress() {
    const classes = useStyles();
    const progress   = useSelector(selectProgress)
    const showProgres= progress.total > 0 && progress.current < progress.total
    const percentage = showProgres ? progress.current/progress.total * 100 : 0
    const progVariant = percentage > 0 ? "determinate" : "indeterminate";
    const progLabel   = percentage > 0 ? `${Math.round(percentage)}%` : ``
    return(
        <>
            {
                showProgres ?
                <Box position="relative" display="inline-flex">
                    <CircularProgress className={classes.cirProgress} variant={progVariant} value={percentage} /> 
                    <Box
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                    <Typography variant="caption" component="div" className={classes.txtProgress}>{progLabel}</Typography>
                    </Box>
                </Box>
                :
                <></>
            }
        </>
    )
}





