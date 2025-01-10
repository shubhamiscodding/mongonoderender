const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

const uri="mongodb://127.0.0.1:27017";
const dbName= "codinggita";

app.use(express.json());


let db,courses;

async function initializeDatabase(){
    try{
        const client = await new MongoClient(uri, { useUnifiedTopology: true }).connect();

        console.log("Connected to MongoDB");

        db = client.db(dbName);
        courses = db.collection("courses");        

        app.listen(port, ()=> {
            console.log(`Server is running on port ${port}`);
        })
    } catch (err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

app.get('/courses', async (req,res) => {
    try{
        const allcourses = await courses.find().toArray();
        res.status(200).json(allcourses);
    }catch(err){
        res.status(500).send("Error fetching students: " + err.message);
    }
});

app.post('/courses',async (req,res) => {
    try{
        const newCourse = req.body;
        const result = await courses.insertOne(newCourse);
        res.status(201).json(result);
    } catch (err){
        res.status(500).send("Error creating student: " + err.message);
    }
});

app.put('/courses/v1/:credits', async (req,res) => {
    try{
        const credits=parseInt(req.params.credits);
        const course = req.body;
        const result = await courses.replaceOne({ credits }, course);
        res.status(200).json(result);
    }catch(err){
        res.status(500).send("Error updating student: " + err.message);
    }
});

app.patch('/courses/v1/:credits' ,async (req,res) => {
    try{
        const credits = parseInt(req.params.credits);
        const update=req.body;

        const result = await courses.updateOne({credits}, { $set: update })
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating student: " + err.message);
    }
});


app.delete('/courses/:courseCode', async (req, res) => {
    try {
        const courseCode = req.params.courseCode; 
        const result = await courses.deleteOne({ courseCode });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting student: " + err.message);
    }
})