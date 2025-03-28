import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, Drawer, IconButton } from "@mui/material";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import * as React from "react";
import AssetInfo from "../components/AssetInfo";

export default function AssetCard({ name, thumbnail }) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Drawer
        sx={{
          width: "100px",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: "35%",
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <Box style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleDrawerClose} style={{ width: "40px" }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography component="div">{name}</Typography>
        </Box>
        <Divider />
        <AssetInfo
          name="Sitting Moomin"
          thumbnail="../../thumbnails/thumbnail.png"
        />
      </Drawer>

      <Card sx={{ maxWidth: 300 }}>
        <CardActionArea onClick={handleDrawerOpen}>
          <CardMedia
            component="img"
            height="250"
            image={thumbnail}
            alt={`${name} + thumbnail`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
