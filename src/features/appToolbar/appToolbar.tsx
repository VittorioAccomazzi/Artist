import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Hidden } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    toolbar : {
      display:'flex',
      justifyContent:'space-between'
    }
  }),
);

export default function AppToolbar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense" className={classes.toolbar}>
          <Hidden xsDown>
            <Typography variant="h6" color="inherit">
              Artist
            </Typography>
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  );
}