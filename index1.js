const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Fix: Import ObjectId

const app = express();
const port = 8000;

// MongoDB connection details
const uri = "mongodb+srv://Shubham:NITa%401234@cluster0.z5xy2.mongodb.net/"; 
const dbName = "codinggita";

// Middleware
app.use(express.json());

let db, students;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
       const client = await new MongoClient(uri, { useUnifiedTopology: true }).connect();
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        students = db.collection("students");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

// Routes

// GET: List all students
app.get('/students', async (req, res) => {
    try {
        const allStudents = await students.find().toArray();
        res.status(200).json(allStudents);
    } catch (err) {
        res.status(500).send("Error fetching students: " + err.message);
    }
});

// POST: Add a new student
app.post('/students', async (req, res) => {
    try {
        const newStudent = req.body;

        // Validate data
        if (!newStudent.name || !newStudent.rollNumber) {
            return res.status(400).send("Invalid data: name and rollNumber are required.");
        }

        const result = await students.insertOne(newStudent);
        res.status(201).send(`Student added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding student: " + err.message);
    }
});

// PUT: Update a student completely
app.put('/students/v1/:name', async (req, res) => {
    try {
        const Name = req.params.name; // Fix: Use the correct parameter
        const updatedStudent = req.body;

        // Validate data
        if (!updatedStudent.name || !updatedStudent.rollNumber) {
            return res.status(400).send("Invalid data: name and rollNumber are required.");
        }

        const result = await students.replaceOne({ Name }, updatedStudent);
        res.status(202).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error updating student: " + err.message);
    }
});

// PATCH: Partially update a student
app.patch('/students/:rollNumber', async (req, res) => {
    try {
        const rollNumber = parseInt(req.params.rollNumber); // Ensure this matches DB data type
        const updates = req.body;

        const result = await students.updateOne({ rollNumber }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating student: " + err.message);
    }
});

// DELETE: Remove a student
app.delete('/students/:rollNumber', async (req, res) => {
    try {
        const rollNumber = parseInt(req.params.rollNumber); // Ensure this matches DB data type
        const result = await students.deleteOne({ rollNumber });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting student: " + err.message);
    }
});

// DELETE by ObjectId
app.delete('/students/v3/:id', async (req, res) => {
    try {
        const ID = req.params.id;

        // Validate ObjectId
        if (!ObjectId.isValid(ID)) {
            return res.status(400).send("Invalid ObjectId");
        }

        const result = await students.deleteOne({ _id: new ObjectId(ID) });

        if (result.deletedCount === 0) {
            return res.status(404).send("Student not found");
        }

        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting student: " + err.message);
    }
});
