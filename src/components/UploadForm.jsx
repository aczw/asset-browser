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
  FormLabel,
  InputLabel,
  Input,
} from "@mui/material";

const style = {
  display: "flex",
  gap: "20px",
  margin: "2%",
  alignItems: "center",
};

const statusOptions = [
  { label: "Approved", id: 1 },
  { label: "Latest", id: 2 },
  { label: "Broken", id: 3 },
  { label: "Published", id: 4 },
];

const versionIncOptions = [
  { label: "Major", id: 1 },
  { label: "Minor", id: 2 },
];

export default function UploadForm() {
  return (
    <FormGroup>
      <Typography variant="h5" component="h2" style={{ margin: "2%" }}>
        Add New Asset
      </Typography>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Asset Name</InputLabel>
        <FormControlLabel required control={<Input />} />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Author</InputLabel>
        <FormControlLabel required control={<Input />} />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Keywords</InputLabel>
        <FormControlLabel required control={<Input />} />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Status</InputLabel>
        <FormControlLabel
          required
          control={
            <Autocomplete
              sx={{ width: 250 }}
              options={statusOptions}
              renderInput={(params) => <TextField {...params} label="Status" />}
              style={{ margin: "2%" }}
            />
          }
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Version Increment</InputLabel>
        <FormControlLabel
          required
          control={
            <Autocomplete
              sx={{ width: 250 }}
              options={versionIncOptions}
              renderInput={(params) => (
                <TextField {...params} label="Version Increment" />
              )}
              style={{ margin: "2%" }}
            />
          }
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Has Texture</InputLabel>
        <FormControlLabel
          required
          control={<Checkbox style={{ margin: "2%" }} />}
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">File</InputLabel>
        <FormControlLabel
          required
          control={<Input type="file" variant="plain" />}
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Thumbnail</InputLabel>
        <FormControlLabel
          required
          control={<Input type="file" variant="plain" />}
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input">Message</InputLabel>
        <FormControlLabel required control={<Input multiline />} />
      </Box>

      <ButtonComponent name="Submit" />
    </FormGroup>
  );
}
