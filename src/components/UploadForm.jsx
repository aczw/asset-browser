import React, { useState } from "react";
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

export default function UploadForm({ isUpdateForm, title }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <FormGroup>
      <Typography variant="h5" component="h2" style={{ margin: "2%" }}>
        {title}
      </Typography>
      <Box style={style}>
        <InputLabel disabled={isUpdateForm} htmlFor="my-input">
          Asset Name
        </InputLabel>
        <FormControlLabel
          disabled={isUpdateForm}
          required
          control={<Input />}
        />
      </Box>

      <Box style={style}>
        <InputLabel disabled={true} htmlFor="my-input">
          Author
        </InputLabel>
        <FormControlLabel disabled={true} required control={<Input />} />
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
      {isUpdateForm && (
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
      )}

      <Box style={style}>
        <InputLabel htmlFor="my-input">Has Texture</InputLabel>
        <FormControlLabel
          checked={isChecked}
          onChange={handleCheckboxChange}
          required
          control={<Checkbox style={{ margin: "2%" }} />}
        />
      </Box>
      {isChecked && (
        <Box>
          <InputLabel htmlFor="my-input">Diffuse Map</InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
          <InputLabel htmlFor="my-input">Roughness Map</InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
          <InputLabel htmlFor="my-input">Normal Map</InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
        </Box>
      )}
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
