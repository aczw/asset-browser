import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import { Checkbox, TextField, FormControlLabel } from '@mui/material';

const marginRight = {
    marginRight: "20px",
};

const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

const options = [
    { label: 'Last Modified', id: 1 },
    { label: 'Date Created', id: 2 },
    { label: 'Author', id: 3 },
];

export default function Sort() {

  return (
    <Box sx={{ width: 250 }} style={containerStyle}>
        <Autocomplete sx={{width:250}} options={options} style={marginRight} renderInput={(params) => <TextField {...params} label="Sort By" />}/>
    </Box>
  );
}