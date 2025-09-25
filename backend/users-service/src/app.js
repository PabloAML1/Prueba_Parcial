import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("users Service is running 🚑");
});

app.listen(4000, () => {
  console.log("Users Service running on port 4000");
});
