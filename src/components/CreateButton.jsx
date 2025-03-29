import React, { useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import UploadForm from "./UploadForm";

const buttonStyle = {
  marginRight: "20px",
  marginTop: "2%",
  marginBottom: "2%",
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  backgroundColor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  padding: "2rem",
};

export default function CreateButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <Button variant="contained" style={buttonStyle} onClick={handleOpen}>
        Create New Asset
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box style={style}>
          <UploadForm
            isUpdateForm={false}
            title={"Add New Asset"}
            handleUpdateClose={handleClose}
          />
        </Box>
      </Modal>
    </Box>
  );
}
