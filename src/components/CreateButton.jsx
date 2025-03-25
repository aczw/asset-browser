import React from "react";
import { Button } from '@mui/material';

const buttonStyle = {
    marginRight: "20px",
    marginTop: "2%",
    marginBottom: "2%",
};

export default function CreateButton() {
    return (<Button variant="contained" style={buttonStyle}>Create New Asset</Button>);
}