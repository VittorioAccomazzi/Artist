
import React from 'react';
import {createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { IconButton, SvgIconTypeMap } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
      color:'inherit',
    },
    menuButtonSelected : {
        marginRight: theme.spacing(2),
        color:'#F0F0FF',
        transform:'scale(1.4, 1.4)',
      }
  }),
);

export type ToolButtonInfo = {
    onClick : ()=>void, 
    Icon : OverridableComponent<SvgIconTypeMap<{}, "svg">>,
    isSelected : boolean
}
export default function ToolButton( { onClick, Icon, isSelected}: ToolButtonInfo) {
  const classes = useStyles();

  const iconClass = (isSelected ? classes.menuButtonSelected : classes.menuButton )   
  
  return (
      <IconButton edge="end" className={iconClass} onClick={e=>onClick()}>  
          <Icon />
      </IconButton>
  )
}