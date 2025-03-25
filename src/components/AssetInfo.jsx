import * as React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import ButtonComponent from './ButtonComponent';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox, TextField, FormControlLabel } from '@mui/material';
import VersionHistory from './VersionHistory';

const options = [
    { label: '01.00.00', id: 1 },
    { label: '01.01.00', id: 2 },
    { label: '02.00.00', id: 3 },
    { label: '03.00.00', id: 4 }
];

export default function AssetInfo({name, thumbnail}) {

    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box style={{  margin: "20px"}}>
            <Card sx={{width: "80%", margin: "auto"}}>
                <CardMedia 
                    component="img"
                    image={thumbnail}
                    alt={`${name} + thumbnail`}
                />
            </Card>
            
            <Box style={{display:"flex", justifyContent: "center", gap:"20px", margin:"10px"}}>
                <ButtonComponent name="Download"/>
                <ButtonComponent name="Update"/>
            </Box>

            <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                <Typography style={{width: "200px"}}>Authors</Typography>
                <TextField fullWidth label="eschou, claran" variant="outlined" margin="normal" disabled/>
            </Box>

            <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                <Typography style={{width: "200px"}}>Keywords</Typography>
                <TextField fullWidth label="creature, moomin, character, sitting, troll" variant="outlined" margin="normal" disabled/>
            </Box>

            <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                <Typography style={{width: "200px"}}>Version</Typography>
                <Autocomplete sx={{width:250}} options={options} renderInput={(params) => <TextField {...params} label={options[2].label} />}/>
            </Box>

            <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                <Typography style={{width: "200px"}}>Has Texture</Typography>
                <Checkbox />
            </Box>

            <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                <Typography style={{width: "200px"}}>Structure Version</Typography>
                <TextField fullWidth label="03.00.00" variant="outlined" margin="normal" disabled/>
            </Box>

            <VersionHistory/>

        </Box> 
    );
}
