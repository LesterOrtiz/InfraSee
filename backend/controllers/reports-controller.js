import asyncHandler from "express-async-handler";
import Report from "../models/reports-model.js";
import User from "../models/user-model.js";

const getReports = asyncHandler(async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('report_mod', 'name')
      .populate('report_status', 'stat_name');

    res.json(reports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const getModeratorReports = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      res.status(400);
      throw new Error("User ID is missing in the request.");
    }

    // Ensure the user is a moderator
    const user = await User.findById(userId);
    if (!user || !user.isModerator) {
      res.status(403);
      throw new Error("Access denied: User is not a moderator.");
    }

    // Fetch reports assigned to the moderator
    const reports = await Report.find({ report_mod: userId })
      .populate('report_mod', 'name')
      .populate('report_status', 'stat_name');

    if (!reports || reports.length === 0) {
      res.status(404);
      throw new Error("No reports found for this moderator.");
    }

    res.json(reports);
  } catch (error) {
    console.error(`Error fetching moderator reports: ${error.message}`);

    if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid report or user ID format.' });
    } else if (error.name === 'ValidationError') {
      res.status(422).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  }
});


export { getReports, getModeratorReports };
