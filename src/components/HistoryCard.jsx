import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Box } from '@mui/material';

export default function HistoryCard({message, author, date, version}) {
    return (
        <Card style={{margin: "10px"}}>
            <CardContent>
                <Typography style={{marginBottom: "20px"}}>
                    {message}
                </Typography>
                <Box style={{display: "flex", justifyContent: "space-between"}}>
                    <Box style={{display: "flex", alignItems: "center", gap:"20px"}}>
                        <Typography>{author}</Typography>
                        <Typography>{date}</Typography>
                    </Box>
                    <Typography>{version}</Typography>
                </Box>

            </CardContent>
        </Card>
    )
}