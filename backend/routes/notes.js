const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// to fetcha all notes using the http://localhost:5000/api/notes/fetchallnotes api
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        // finds note by jwt id
        const notes = await Notes.find({ user: req.user.id });
        res.send(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

// to add note using the http://localhost:5000/api/notes/addnotes api
router.post('/addnotes', fetchUser, [
    body('title', 'Title too short').isLength({ min: 3 }),
    body('description', 'Description too short').isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // add a note
        const note = new Notes({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.send(note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

// to update using the http://localhost:5000/api/notes/updatenote/:id api
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        const editedNote = {};
        // finds if title or description or tag is sent by the user
        if (title) { editedNote.title = title };
        if (description) { editedNote.description = description };
        if (tag) { editedNote.tag = tag };

        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        // checks if note userId matches with jwt id
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied");
        }
        // if matches then update
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: editedNote }, { new: true });
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

// to delete note using the http://localhost:5000/api/notes/deletenote/:id api
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        const editedNote = {};
        // finds if title or description or tag is sent by the user
        if (title) { editedNote.title = title };
        if (description) { editedNote.description = description };
        if (tag) { editedNote.tag = tag };

        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        // checks if note userId matches with jwt id
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied");
        }
        // if matches then delete
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }

})

module.exports = router;