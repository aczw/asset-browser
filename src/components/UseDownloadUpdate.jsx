import React, { useState } from "react";

export const useDownloadUpdate = () => {
  const [openDownload, setOpenDownload] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const handleDownloadOpen = () => {
    setOpenDownload(true);
  };

  const handleDownloadClose = () => {
    setOpenDownload(false);
  };

  const handleUpdateOpen = () => {
    setOpenUpdate(true);
  };

  const handleUpdateClose = () => {
    setOpenUpdate(false);
  };

  return {
    openDownload,
    openUpdate,
    handleDownloadOpen,
    handleDownloadClose,
    handleUpdateOpen,
    handleUpdateClose,
    setOpenDownload,
    setOpenUpdate,
  };
};
