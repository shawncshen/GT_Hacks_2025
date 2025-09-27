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
    const role = req.body.role;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone_number = req.body.phone_number;

    if (role === "caregiver"){
      const checkUser = await db.query("select * from caregivers where email = $1", [email]);
      if (checkUser.rows.length > 0){
        res.json({"response": "User already exists"});
      } else {
        bcrypt.hash(password, salt_rounds, async (err, hash) => {
          if (err){
            console.log(err);
          } else {
            const result = await db.query("insert into caregivers (email, password, first_name, last_name, phone_number) values ($1, $2, $3, $4, $5) returning caregiver_id", [email, hash, first_name, last_name, phone_number]);
            const user_id = result.rows[0].caregiver_id;
            res.json({ "response": "success", "userID": user_id });
          }
        })
        
      }
    } else if (role === "patient"){
      const checkUser = await db.query("select * from patients where email = $1", [email]);
      if (checkUser.rows.length > 0){
        res.json({"response": "User already exists"});
      } else {
        bcrypt.hash(password, salt_rounds, async (err, hash) => {
          if (err){
            console.log(err);
          } else {
            const result = await db.query("insert into patients (email, password, first_name, last_name, phone_number) values ($1, $2, $3, $4, $5) returning patient_id", [email, hash, first_name, last_name, phone_number]);
            const user_id = result.rows[0].patient_id;
            res.json({ "response": "success", "userID": user_id });
          }
        })
        
      }
    }

    
  } catch (error){
    res.json({"response": error});
  }

});

//This one is for adding prescriptions for the patient (Potentially done through caregiver)
app.post("post-prescription", async (req, res) => {
  const prescription_name = req.body.prescription_name;
  const prescription_amount = req.body.prescription_amount;
  const prescription_frequency = req.body.prescription_frequency;
  const patient_id = req.body.patient_id;

  try{
    const result = await db.query("insert into prescriptions (patient_id, prescription_name, prescription_amount, prescription_frequency) values ($1, $2, $3, $4)", [patient_id, prescription_name, prescription_amount, prescription_frequency]);
    res.json({"response": "success"})
  } catch (error){
    res.json({"response": error});
  }

});

//This one is for adding patients for the loggedIn caregiver
app.post("/add-patient", async (req, res) => {
  const caregiver_id = req.body.caregiver_id;
  const patient_email = req.body.patient_email;

  try{
    const patient_result = await db.query("select patient_id from patients where email = $1", [patient_email]);

    if (patient_result.rows.length === 0){
      return res.json({"response": "Patient not found"});
    }

    const patient_id = patient_result.rows[0].patient_id;

    const result = await db.query("insert into caregiver_patients (caregiver_id, patient_id) values ($1, $2)", [caregiver_id, patient_id]);
    res.json({"response": "success"})

  } catch (error){
    res.json({"response": error})
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
})