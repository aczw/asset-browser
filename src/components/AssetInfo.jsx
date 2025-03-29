import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import ButtonComponent from "./ButtonComponent";
import Autocomplete from "@mui/material/Autocomplete";
import { Checkbox, TextField, FormControlLabel, Modal } from "@mui/material";
import VersionHistory from "./VersionHistory";
import DownloadModal from "./DownloadModal";
import UploadForm from "./UploadForm";
import { useDownloadUpdate } from "./UseDownloadUpdate";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  padding: "2rem",
};

const boxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  margin: "2%",
};

const labelWidth = { width: "100px" };

const fieldWidth = { width: "70%" };

const options = [
  { label: "01.00.00", id: 1 },
  { label: "01.01.00", id: 2 },
  { label: "02.00.00", id: 3 },
  { label: "03.00.00", id: 4 },
];

const keywordOptions = [
  { label: "creature", id: 1 },
  { label: "moomin", id: 2 },
  { label: "character", id: 3 },
  { label: "sitting", id: 4 },
  { label: "troll", id: 5 },
];

const authorOptions = [
  { label: "echou", id: 1 },
  { label: "claran", id: 2 },
];

export default function AssetInfo({ name, thumbnail, handle }) {
  const {
    openDownload,
    openUpdate,
    handleDownloadOpen,
    handleDownloadClose,
    handleUpdateOpen,
    handleUpdateClose,
  } = useDownloadUpdate();

  return (
    <Box style={{ margin: "20px" }}>
      <Card sx={{ width: "80%", margin: "auto" }}>
        <CardMedia
          component="img"
          image={thumbnail}
          alt={`${name} + thumbnail`}
        />
      </Card>

      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          margin: "2%",
          paddingTop: "2%",
          paddingBottom: "4%",
        }}
      >
        <ButtonComponent name="Download" onClick={handleDownloadOpen} />
        <ButtonComponent name="Update" onClick={handleUpdateOpen} />
        <Modal
          open={openDownload}
          onClose={handleDownloadClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box style={({ width: "50%" }, style)}>
            <DownloadModal
              assetName={name}
              handleDownloadClose={handleDownloadClose}
            />
          </Box>
        </Modal>
        <Modal
          open={openUpdate}
          onClose={handleUpdateClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box style={({ width: "400" }, style)}>
            <UploadForm
              isUpdateForm={true}
              title={"Update Asset"}
              handleUpdateClose={handleUpdateClose}
            />
          </Box>
        </Modal>
      </Box>

      <Box style={boxStyle}>
        <Typography style={labelWidth}>Authors</Typography>
        <Autocomplete
          multiple
          id="tags-readOnly"
          options={authorOptions.map((option) => option.label)}
          defaultValue={authorOptions.map((option) => option.label)}
          readOnly
          renderInput={(params) => <TextField {...params} label="Authors" />}
          size="small"
          style={fieldWidth}
        />
      </Box>

      <Box style={boxStyle}>
        <Typography style={labelWidth}>Keywords</Typography>
        <Autocomplete
          multiple
          id="tags-readOnly"
          options={keywordOptions.map((option) => option.label)}
          defaultValue={keywordOptions.map((option) => option.label)}
          readOnly
          renderInput={(params) => <TextField {...params} label="Keywords" />}
          size="small"
          style={fieldWidth}
        />
      </Box>

      <Box style={boxStyle}>
        <Typography style={labelWidth}>Version</Typography>
        <Autocomplete
          sx={{ width: 250 }}
          options={options}
          renderInput={(params) => (
            <TextField {...params} label={options[2].label} />
          )}
          style={fieldWidth}
        />
      </Box>

      <Box style={boxStyle}>
        <Typography style={labelWidth}>Has Texture</Typography>
        <Checkbox />
      </Box>

      {/* <Box style={boxStyle}>
        <Typography style={labelWidth}>Structure Version</Typography>
        <TextField
          label="03.00.00"
          variant="outlined"
          margin="normal"
          disabled
          style={fieldWidth}
        />
      </Box> */}

      <VersionHistory />
    </Box>
  );
}
