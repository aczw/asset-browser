import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryCard from './HistoryCard';


export default function VersionHistory() {
  return (
      <Accordion>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
        >
            <Typography component="span">Version History</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <HistoryCard message="Commit message text goes here" author="claran" date="Feb 14 2025" version="03.00.00"/>
            <HistoryCard message="Commit message text goes here" author="claran" date="Jan 22 2025" version="02.00.00"/>
            <HistoryCard message="Commit message text goes here" author="claran" date="Jan 11 2025" version="01.01.00"/>
            <HistoryCard message="Commit message text goes here" author="claran" date="Jan 10 2025" version="01.00.00"/>

        </AccordionDetails>
      </Accordion>
  );
}

