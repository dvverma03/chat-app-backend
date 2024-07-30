const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeToGroup,
} = require("../controllers/chatControllers.js");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChat);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupRemove").put(protect, removeToGroup);

module.exports = router;
