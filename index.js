const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();

let courses = require("./courses"); // import mảng courses từ file courses.json
const { dynamodb } = require("./aws.helper");
const MonhocModel = require("./data.model");
const AWS = require("aws-sdk");

const multer = require("multer");
const { uploadFile } = require("./file.service");

app.use(express.json()); // for parsing application/json
// register middleware
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("./views")); // cho phép truy cập vào thư mục views

// config view engine
app.set("view engine", "ejs"); // Khai báo rằng app sẽ dùng engine EJS để render trang web
app.set("views", "./views"); // Khai báo thư mục chứa các file view

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "/");
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
}).single("image"); // tên field trong form

// app.get('/', (req, res) => {
//     return res.render('index', { courses }); // render file index.ejs và truyền vào mảng courses
// });

app.get("/", async (req, res) => {
  try {
    const courses = await MonhocModel.getAllMonHoc();
    console.log("🚀 ~ app.get ~ courses:", courses);

    res.render("index", { courses });
  } catch (error) {
    console.log("Error getAllMonHoc", error);
    res.status(500).send(error);
  }
});

// app.post('/save', (req, res) => {
//     const { name, type, semester, department, id } = req.body;

//     const newCourse = { id, name, type, semester, department };
//     courses.push(newCourse);

//     return res.redirect('/');
// });

app.post("/save", upload, async (req, res) => {
  try {
    const image = req.file;
    const imageUrl = await uploadFile(image);

    const { name, type, semester, department, id } = req.body;

    const newCourse = { id, name, type, semester, department, image: imageUrl };

    await MonhocModel.createMonHoc(newCourse);
    res.redirect("/");
  } catch (error) {
    console.log("Error createMonHoc", error);
    res.status(500).send(error);
  }
});

// app.get('/edit/:id', (req, res) => {
//     const { id } = req.params;
//     const course = courses.find(course => course.id === id);

//     return res.render('edit', { course });
// })

// app.get('/delete/:id', (req, res) => {
//     const { id } = req.params;
//     courses = courses.filter(course => course.id !== id);

//     return res.redirect('/');
// })

// Add this route to render the edit form
app.get("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await MonhocModel.getMonHocById(id);

    if (!course) {
      return res.status(404).send("Course not found");
    }

    res.render("edit", { course });
  } catch (error) {
    console.log("Error getting course for edit:", error);
    res.status(500).send(error);
  }
});

app.post("/edit/:id", upload, async (req, res) => {
  try {
    const { id, name, type, semester, department } = req.body;
    let image = null;

    // Get the current course to preserve image if no new one was uploaded
    const currentCourse = await MonhocModel.getMonHocById(id);

    // If a new image was uploaded, process it
    if (req.file) {
      image = await uploadFile(req.file);
    } else {
      // Keep the existing image
      image = currentCourse.image;
    }

    const updatedCourse = {
      id,
      name,
      type,
      semester,
      department,
      image,
    };

    await MonhocModel.updateMonHoc(updatedCourse);
    res.redirect("/");
  } catch (error) {
    console.log("Error updating course:", error);
    res.status(500).send(error);
  }
});

app.get("/delete/:id/", async (req, res) => {
  const { id } = req.params;

  try {
    const course = await MonhocModel.getMonHocById(id);

    if (course) {
      console.log("🚀 ~ app.get ~ course:", course);

      await MonhocModel.deleteMonHoc(course.id, course.name);
    }
    res.redirect("/");
  } catch (error) {
    console.log("Error deleteMonHoc", error);
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log("Server is running http://localhost:" + PORT);
});
