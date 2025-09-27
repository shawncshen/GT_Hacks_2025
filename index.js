import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import pg from "pg";
import "dotenv/config";

const app = express();
const salt_rounds = 10;

const pg_password = process.env.PG_PASSWORD;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "hackGT12",
  password: pg_password,
  port: 5433,
});

db.connect();

app.use(express.json());
app.use(cors());

app.post("/login", async (req, res) => {
  try{
    const email = req.body.email;
    const password = req.body.password;

    const checkUser = await db.query("select * from patients where email = $1", [email]);
    if(checkUser.rows.length > 0){
      bcrypt.compare(password, checkUser.rows[0].password, (err, result) => {
        if (err){
          console.log(err);
        } else {
          if (result){
            res.json({"response": "success", "userID": checkUser.rows[0].patient_id});
          } else {
            res.json({"response": "Incorrect password"});
          }
        }
      })
    } else {
      res.json({"response": "User not found"});
    }
  } catch (error){
    res.json({"response": error});
  }

});

app.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const checkUser = await db.query("select * from patients where email = $1", [email]);
    if (checkUser.rows.length > 0){
      res.json({"response": "User already exists"});
    } else {
      bcrypt.hash(password, salt_rounds, async (err, hash) => {
        if (err){
          console.log(err);
        } else {
          const result = await db.query("insert into patients (email, password) values ($1, $2) returning patient_id", [email, hash]);
          const user_id = result.rows[0].patient_id;
          res.json({ "response": "success", "userID": user_id });
        }
      })
      
    }
  } catch (error){
    res.json({"response": error});
  }

});

app.post("post-prescription", async (req, res) => {

});

app.listen(3000, () => {
  console.log("Listening on port 3000");
})