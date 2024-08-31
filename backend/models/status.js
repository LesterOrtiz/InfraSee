import mongoose from "mongoose";

const statusSchema = mongoose.Schema(
    {
        stat_name: {
            type: String,
            required: true
        }
    }
)

const Status = mongoose.model('Status', statusSchema);
export default Status