const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },

    description: { type: String },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Workspace", WorkspaceSchema);
