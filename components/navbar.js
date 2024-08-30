import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
// import SmartToyIcon from '@mui/icons-material/SmartToy'; // Chat bot icon

export default function Navbar({ home }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar >
        {/* <Toolbar> */}
         
          {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project 5 AI Professor
          </Typography> */}
          {/* <Button color="inherit" href={home ? '/generate' : '/'}>
            {home ? 'generate' : 'homepage'}
          </Button> */}
        {/* </Toolbar> */}
      </AppBar>
    </Box>
  );
}