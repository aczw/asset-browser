import React from "react";
import { Button } from "@mui/material";

export default function ButtonComponent({ name, onClick }) {
  return (
    <Button variant="outlined" onClick={onClick}>
      {name}
    </Button>
  );
}
