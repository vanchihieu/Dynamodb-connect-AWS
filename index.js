const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();

const MonhocModel = require("./data.model");

const multer = require("multer");
const { uploadFile } = require("./file.service");

app.use(express.json());
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

const validateCourseData = (req, res, next) => {
  const { id, name, type, semester, department } = req.body;
  const errors = [];

  // Check required fields
  if (!id) errors.push("STT không được để trống");
  if (!name) errors.push("Tên môn học không được để trống");
  if (!type) errors.push("Loại môn học không được để trống");
  if (!semester) errors.push("Học kỳ không được để trống");
  if (!department) errors.push("Khoa không được để trống");

  // For create operation, require image
  if (req.path === "/save" && !req.file) {
    errors.push("Hình ảnh là bắt buộc");
  }

  if (errors.length > 0) {
    // For create form
    if (req.path === "/save") {
      return MonhocModel.getAllMonHoc()
        .then((courses) => {
          res.render("index", { courses, errors });
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
    // For edit form
    else {
      return res.render("edit", { course: req.body, errors });
    }
  }

  next();
};

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

app.post("/save", upload, validateCourseData, async (req, res) => {
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

    const currentCourse = await MonhocModel.getMonHocById(id);

    if (req.file) {
      image = await uploadFile(req.file);
    } else {
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
    await MonhocModel.deleteMonHoc(id);
    res.redirect("/");
  } catch (error) {
    console.log("Error deleteMonHoc", error);
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log("Server is running http://localhost:" + PORT);
});
