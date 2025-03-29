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

const labelWidth = {
  width: "150px",
};

const fieldWidth = { width: "70%" };

const formControlWidth = { width: "100%" };

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

const keywordOptions = [
  { label: "creature", id: 1 },
  { label: "moomin", id: 2 },
  { label: "character", id: 3 },
  { label: "sitting", id: 4 },
  { label: "troll", id: 5 },
];

export default function UploadForm({ isUpdateForm, title, handleUpdateClose }) {
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
        <InputLabel
          disabled={isUpdateForm}
          htmlFor="my-input"
          style={labelWidth}
        >
          Asset Name
        </InputLabel>
        <FormControlLabel
          disabled={isUpdateForm}
          required
          control={<Input style={fieldWidth} />}
          style={formControlWidth}
        />
      </Box>

      <Box style={style}>
        <InputLabel disabled={true} htmlFor="my-input" style={labelWidth}>
          Author
        </InputLabel>
        <FormControlLabel
          disabled={true}
          required
          control={<Input style={fieldWidth} />}
          style={formControlWidth}
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          Keywords
        </InputLabel>
        <FormControlLabel
          required
          style={formControlWidth}
          control={
            <Autocomplete
              multiple
              id="tags-outlined"
              options={keywordOptions.map((option) => option.label)}
              defaultValue={
                isUpdateForm
                  ? keywordOptions.map((option) => option.label)
                  : undefined
              }
              renderInput={(params) => (
                <TextField {...params} label="Keywords" />
              )}
              style={fieldWidth}
            />
          }
        />
      </Box>

      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          Status
        </InputLabel>
        <FormControlLabel
          required
          style={formControlWidth}
          control={
            <Autocomplete
              sx={{ width: 250 }}
              options={statusOptions}
              renderInput={(params) => <TextField {...params} label="Status" />}
              style={({ margin: "2%" }, fieldWidth)}
            />
          }
        />
      </Box>
      {isUpdateForm && (
        <Box style={style}>
          <InputLabel htmlFor="my-input" style={labelWidth}>
            Version Increment
          </InputLabel>
          <FormControlLabel
            required
            style={formControlWidth}
            control={
              <Autocomplete
                sx={{ width: 250 }}
                options={versionIncOptions}
                renderInput={(params) => (
                  <TextField {...params} label="Version Increment" />
                )}
                style={({ margin: "2%" }, fieldWidth)}
              />
            }
          />
        </Box>
      )}

      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          Has Texture
        </InputLabel>
        <FormControlLabel
          checked={isChecked}
          onChange={handleCheckboxChange}
          required
          style={formControlWidth}
          control={<Checkbox style={{ margin: "2%" }} />}
        />
      </Box>
      {isChecked && (
        <Box>
          <InputLabel htmlFor="my-input" style={labelWidth}>
            Diffuse Map
          </InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
          <InputLabel htmlFor="my-input" style={labelWidth}>
            Roughness Map
          </InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
          <InputLabel htmlFor="my-input" style={labelWidth}>
            Normal Map
          </InputLabel>
          <FormControlLabel
            required
            control={<Input type="file" variant="plain" />}
          />
        </Box>
      )}
      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          File
        </InputLabel>
        <FormControlLabel
          required
          control={<Input type="file" variant="plain" style={fieldWidth} />}
          style={formControlWidth}
        />
      </Box>
      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          Thumbnail
        </InputLabel>
        <FormControlLabel
          required
          control={<Input type="file" variant="plain" style={fieldWidth} />}
          style={formControlWidth}
        />
      </Box>
      <Box style={style}>
        <InputLabel htmlFor="my-input" style={labelWidth}>
          Message
        </InputLabel>
        <FormControlLabel
          required
          control={<Input multiline style={fieldWidth} />}
          style={formControlWidth}
        />
      </Box>

      <Box style={{ display: "flex", gap: "20px", margin: "2%" }}>
        <ButtonComponent name="Cancel" onClick={handleUpdateClose} />
        <ButtonComponent name="Submit" />
      </Box>
    </FormGroup>
  );
}
