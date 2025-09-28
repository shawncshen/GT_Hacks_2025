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

//Login patient or caregiver
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

//Register patient or caregiver
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
app.post("/post-prescriptions", async (req, res) => {
  const {patient_id, prescriptions} = req.body;

  try{
    const addedPrescriptions = [];
    for (const p of prescriptions){
      const result = await db.query("insert into prescriptions (prescription_name, prescription_amount, prescription_frequency, patient_id) values ($1, $2, $3, $4)", 
        [p.name, p.amount, p.frequency, patient_id]
      );

    }
    
    addedPrescriptions.push(result.rows[0]);

    res.json({"response": "success", "prescriptions": addedPrescriptions});
  } catch (error){
    console.log(error);
    res.json({"response": error});
  }

});

//Sends either patient to caregiver or caregiver to patient
app.post("/send-notification", async (req, res) => {
  const sender_id = req.body.sender_id;
  const receiver_email = req.body.receiver_email;
  const sender_type = req.body.sender_type;
  
  const context = sender_type === "caregiver" ? "caregivers" : "patients";
  const receiver_type = sender_type === "caregiver" ? "patient" : "caregiver";

  let receiver_id = null;
  let message = null;

  try {
    if (context === "caregivers"){
      const receiver_result = await db.query("select caregiver_id from caregivers where email = $1", [receiver_email]);
      receiver_id = receiver_result.rows[0].caregiver_id;
      message = "Patient to Caregiver";
    } else {
      const receiver_result = await db.query("select patient_id from patients where email = $1", [receiver_email]);
      receiver_id = receiver_result.rows[0].patient_id;
      message = "Caregiver to Patient";
    }

    const result = await db.query("insert into notifications (sender_id, sender_type, receiver_id, receiver_type, message) values ($1, $2, $3, $4, $5)", [sender_id, sender_type, receiver_id, receiver_type, message]);
    res.json({"response": "success"});

  } catch (error) {
    console.log(error)
    res.json({"response": error});
  }
  
});

//Gets pending notifications for whichever user is logged in (Patient or Caregiver)
app.post("/get-notifications", async (req, res) => {
  const user_id = req.body.user_id;
  const user_type = req.body.user_type;

  try {
    const result = await db.query(
      "select message, sender_id, sender_type from notifications where receiver_id = $1 and receiver_type = $2", 
      [user_id, user_type]
    );

    if (result.rows.length === 0) {
      return res.json({"response": "No notifications found", "notifications": []});
    }

    // Extract all messages and full notification data
    const notifications = result.rows.map(row => ({
      message: row.message,
      sender_id: row.sender_id,
      sender_type: row.sender_type,
    }));

    res.json({
      "response": "success",
      "notifications": notifications,
    });

  } catch (error) {
    console.log(error);
    res.json({"response": "Server error", "notifications": []});
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
})