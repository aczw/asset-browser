import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const mystyle = {
    marginLeft: "20px",
  };

export default function SearchBar() {

  return (
    <Box sx={{ width: 500 }}>
      <TextField fullWidth label="Search" variant="outlined" margin="normal" style={mystyle}/>
    </Box>
  );
}