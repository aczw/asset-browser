import React from "react";
import { Button } from '@mui/material';

export default function ButtonComponent({name}) {
    return (<Button variant="outlined">{name}</Button>);
}