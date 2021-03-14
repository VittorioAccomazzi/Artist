import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {BilateralPainter, TensorPainter} from './paintersTools'
import DownloadTool from './downloadTool'
import UploadTool from './uploadTool'
import PainterProgress from './painterProgress'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    toolbar : {
      display:'flex',
      justifyContent:'space-between'
    },
    toolList : {
      display:'flex',
      alignItems:'center'
    }
  }),
);

export default function AppToolbar() {
  const classes = useStyles();
  const showButtons = new URLSearchParams(window.location.search).get('all') != null

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense" className={classes.toolbar}>
            <Typography variant="h6" color="inherit">
              Artist
            </Typography>
          <div className={classes.toolList}>
            <PainterProgress/>
            {
              showButtons ?
              <>
              <BilateralPainter/>
              <TensorPainter/>
              </> :
              <></>
            }
            <DownloadTool/>
            <UploadTool/>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}