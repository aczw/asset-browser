import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import { Checkbox, TextField, FormControlLabel } from '@mui/material';

const marginLeft = {
    marginLeft: "20px",
};

const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

const options = [
    { label: 'echou', id: 1 },
    { label: 'jyguan', id: 2 },
    { label: 'geant', id: 3 },
    { label: 'willcai', id: 4 },
    { label: 'soominp', id: 5 },
    { label: 'czw', id: 6 },
    { label: 'aajiang', id: 7 },
    { label: 'chuu', id: 8 },
    { label: 'claran', id: 9 },
    { label: 'fernc', id: 10 },
    { label: 'cxndy', id: 11 },
    { label: 'raclin', id: 12 },
    { label: 'liuamy', id: 13 },
];

export default function SearchBar() {

  return (
    <Box sx={{ width: 1000 }} style={containerStyle}>
        <Autocomplete sx={{width:250}} options={options} style={marginLeft} renderInput={(params) => <TextField {...params} label="Author" />}/>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker label="From" />
            </DemoContainer>
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker label="To" />
            </DemoContainer>
        </LocalizationProvider>
        
        <FormControlLabel control={<Checkbox />} label="Has Texture" />
    </Box>
  );
}