const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
// const CommentRouter = require("./routes/CommentRouter");

app.use("/public", express.static("public"));

dbConnect();

app.use(
    cors({
        origin: true, // Cho phép tất cả các origin
        credentials: true, // Cho phép gửi cookies
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
        ],
    })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/admin", AdminRouter);

app.get("/", (request, response) => {
    response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
    console.log("server listening on port 8081");
});
