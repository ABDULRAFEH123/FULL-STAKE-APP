import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import Modal from "./Modal";

const UpdateProfile = () => {
  const [showModal, setShowModal] = useState(false);

  const handleIconClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <div className="cursor-pointer" onClick={handleIconClick}>
        <CgProfile size={40} />
      </div>
      <Modal show={showModal} onClose={handleCloseModal} />
    </>
  );
};

export default UpdateProfile;
