import * as React from "react";
import ButtonComponent from "./ButtonComponent";
import {
  Checkbox,
  TextField,
  FormControlLabel,
  FormGroup,
  Autocomplete,
  Box,
  Typography,
} from "@mui/material";
import { useDownloadUpdate } from "./UseDownloadUpdate";

const versionOptions = [
  { label: "01.00.00", id: 1 },
  { label: "01.01.00", id: 2 },
  { label: "02.00.00", id: 3 },
  { label: "03.00.00", id: 4 },
];

const DCCoptions = [
  { label: "None", id: 1 },
  { label: "Maya", id: 2 },
  { label: "Houdini", id: 3 },
  { label: "Blender", id: 4 },
];

export default function DownloadModal({ assetName }) {
  const { handleDownloadClose, setOpenDownload } = useDownloadUpdate();

  const [selected, setSelected] = React.useState("");

  let buttonLabel = "Download";

  if (selected == "None") {
    buttonLabel = "Download";
  } else {
    buttonLabel = "Download & Launch";
  }

  return (
    <FormGroup>
      <Typography variant="h5" component="h2" style={{ margin: "2%" }}>
        Download {assetName}
      </Typography>

      <FormControlLabel
        required
        control={
          <Autocomplete
            sx={{ width: 250 }}
            options={versionOptions}
            renderInput={(params) => (
              <TextField {...params} label="Asset Version" />
            )}
            style={{ margin: "2%" }}
          />
        }
      />

      <FormControlLabel
        required
        control={
          <Autocomplete
            sx={{ width: 250 }}
            selected={selected}
            onInputChange={(event, newSelected) => {
              setSelected(newSelected);
            }}
            options={DCCoptions}
            renderInput={(params) => (
              <TextField {...params} label="Launch in..." />
            )}
            style={{ margin: "2%" }}
          />
        }
      />

      <FormControlLabel
        required
        control={<Checkbox style={{ margin: "2%" }} />}
        label="Download textures?"
      />

      <Box style={{ display: "flex", gap: "20px" }}>
        <ButtonComponent name="Cancel" onClick={handleDownloadClose} />
        <ButtonComponent name={buttonLabel} />
      </Box>
    </FormGroup>
  );
}
