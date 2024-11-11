const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const registeredUsers = require("./models/registeredUsers");
const modelEmployeeRegister = require("./models/modelEmployeeRegister");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files for images
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/loginCredentials", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection
    .once("open", () => console.log("Connected to DB....."))
    .on("error", () => console.log("Problem connecting to DB."));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./Images"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// User registration endpoint
app.post("/register", (req, res) => {
    registeredUsers.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                res.json("Email already registered.");
            } else {
                const newUser = new registeredUsers(req.body);
                newUser.save()
                    .then(() => res.json("Registration successful."))
                    .catch(() => res.json("Failed to save data."));
            }
        })
        .catch(() => res.json("Registration error."));
});

// Login endpoint
app.post("/login", (req, res) => {
    registeredUsers.findOne({ email: req.body.email })
        .then((user) => {
            if (user && user.cnfPassword === req.body.password) {
                res.json({ status: "success", id: user._id });
            } else {
                res.json({ status: "fail" });
            }
        })
        .catch(() => res.json({ status: "noUser" }));
});

// Retrieve user data for dashboard
app.get("/user/:ID", (req, res) => {
    registeredUsers.findById(req.params.ID)
        .then((user) => res.json(user ? user.name : "User not found."))
        .catch(() => res.json("Error retrieving user data."));
});

// Create employee endpoint
app.post("/employees", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json("File upload failed.");
    }
    modelEmployeeRegister.findOne({ email: req.body.email })
        .then((existingUser) => {
            if (existingUser) {
                res.json("Email already registered.");
            } else {
                const newEmployee = new modelEmployeeRegister({
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    designation: req.body.designation,
                    gender: req.body.gender,
                    course: req.body.course,
                    image: req.file.filename
                });
                newEmployee.save()
                    .then(() => res.json("Employee created successfully."))
                    .catch(() => res.status(500).json("Failed to save employee data."));
            }
        })
        .catch(() => res.json("Error in employee registration."));
});

// Retrieve all employees
app.get("/employee-list", (req, res) => {
    modelEmployeeRegister.find()
        .then((employees) => res.json(employees))
        .catch(() => res.status(500).json("Error fetching employee list."));
});

// Retrieve individual employee for editing
app.get("/employee-list/:ID", (req, res) => {
    modelEmployeeRegister.findById(req.params.ID)
        .then((employee) => res.json(employee))
        .catch(() => res.status(404).json("Employee not found."));
});

// Update employee details
app.put("/employee-list/:ID", upload.single("image"), (req, res) => {
    const updateData = { ...req.body };
    if (req.file) {
        updateData.image = req.file.filename; // Update image if a new one is uploaded
    }
    modelEmployeeRegister.findByIdAndUpdate(req.params.ID, updateData, { new: true })
        .then(() => res.json("Employee updated successfully."))
        .catch(() => res.status(500).json("Failed to update employee."));
});

// Delete employee
app.delete("/employee-list/:ID", (req, res) => {
    modelEmployeeRegister.findByIdAndDelete(req.params.ID)
        .then(() => res.json("Employee deleted successfully."))
        .catch(() => res.status(500).json("Failed to delete employee."));
});

// Start server
app.listen(4001, () => {
    console.log("Server listening at http://localhost:4001...");
});
