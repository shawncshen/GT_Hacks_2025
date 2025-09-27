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
    console.log("Received registration request:", req.body);
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone_number = req.body.phone_number;

    console.log("Role received:", role);

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
    } else {
      console.log("Invalid role provided:", role);
      res.json({"response": "Invalid role. Must be 'patient' or 'caregiver'"});
    }

  } catch (error){
    console.log("Registration error:", error);
    res.json({"response": error});
  }

});

// Get all available patients for caregiver to select
app.get("/patients", async (req, res) => {
  try {
    const result = await db.query("SELECT patient_id, email, first_name, last_name FROM patients ORDER BY first_name, last_name");
    res.json({"response": "success", "patients": result.rows});
  } catch (error) {
    console.log("Error fetching patients:", error);
    res.json({"response": "Error fetching patients"});
  }
});

// Get all available caregivers for patient to select
app.get("/caregivers", async (req, res) => {
  try {
    const result = await db.query("SELECT caregiver_id, email, first_name, last_name, workplace FROM caregivers ORDER BY first_name, last_name");
    res.json({"response": "success", "caregivers": result.rows});
  } catch (error) {
    console.log("Error fetching caregivers:", error);
    res.json({"response": "Error fetching caregivers"});
  }
});

// Get patient information by ID
app.get("/patient/:patient_id", async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const result = await db.query("SELECT patient_id, email, first_name, last_name, phone_number FROM patients WHERE patient_id = $1", [patient_id]);

    if (result.rows.length > 0) {
      res.json({"response": "success", "patient": result.rows[0]});
    } else {
      res.json({"response": "Patient not found"});
    }
  } catch (error) {
    console.log("Error fetching patient:", error);
    res.json({"response": "Error fetching patient"});
  }
});

// Get caregiver assigned to a specific patient
app.get("/patient-caregiver/:patient_id", async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const result = await db.query(`
      SELECT c.caregiver_id, c.email, c.first_name, c.last_name, c.workplace
      FROM caregivers c
      JOIN caregiver_patients cp ON c.caregiver_id = cp.caregiver_id
      WHERE cp.patient_id = $1
      LIMIT 1
    `, [patient_id]);

    if (result.rows.length > 0) {
      res.json({"response": "success", "caregiver": result.rows[0]});
    } else {
      res.json({"response": "success", "caregiver": null});
    }
  } catch (error) {
    console.log("Error fetching patient caregiver:", error);
    res.json({"response": "Error fetching caregiver"});
  }
});

// Assign patient to caregiver
app.post("/assign-patient", async (req, res) => {
  try {
    const caregiver_id = req.body.caregiver_id;
    const patient_id = req.body.patient_id;

    console.log("Assigning patient", patient_id, "to caregiver", caregiver_id);

    // Check if relationship already exists
    const existing = await db.query("SELECT * FROM caregiver_patients WHERE caregiver_id = $1 AND patient_id = $2", [caregiver_id, patient_id]);

    if (existing.rows.length > 0) {
      res.json({"response": "Patient already assigned to this caregiver"});
    } else {
      await db.query("INSERT INTO caregiver_patients (caregiver_id, patient_id) VALUES ($1, $2)", [caregiver_id, patient_id]);
      res.json({"response": "success"});
    }
  } catch (error) {
    console.log("Error assigning patient:", error);
    res.json({"response": "Error assigning patient"});
  }
});

// Get patients assigned to a specific caregiver
app.get("/caregiver-patients/:caregiver_id", async (req, res) => {
  try {
    const caregiver_id = req.params.caregiver_id;
    const result = await db.query(`
      SELECT p.patient_id, p.email, p.first_name, p.last_name, p.phone_number
      FROM patients p
      JOIN caregiver_patients cp ON p.patient_id = cp.patient_id
      WHERE cp.caregiver_id = $1
      ORDER BY p.first_name, p.last_name
    `, [caregiver_id]);

    res.json({"response": "success", "patients": result.rows});
  } catch (error) {
    console.log("Error fetching caregiver patients:", error);
    res.json({"response": "Error fetching patients"});
  }
});

// Request caregiver by email (patient requesting caregiver)
app.post("/request-caregiver", async (req, res) => {
  try {
    const { patient_id, caregiver_email, patient_email } = req.body;

    // Check if caregiver exists
    const caregiverCheck = await db.query("SELECT caregiver_id, first_name, last_name FROM caregivers WHERE email = $1", [caregiver_email]);

    if (caregiverCheck.rows.length === 0) {
      res.json({"response": "Caregiver not found with that email"});
      return;
    }

    const caregiver_id = caregiverCheck.rows[0].caregiver_id;

    // Check if request already exists
    const existingRequest = await db.query(
      "SELECT * FROM caregiver_requests WHERE patient_id = $1 AND caregiver_id = $2 AND status = 'pending'",
      [patient_id, caregiver_id]
    );

    if (existingRequest.rows.length > 0) {
      res.json({"response": "Request already sent to this caregiver"});
      return;
    }

    // Check if already connected
    const existingConnection = await db.query(
      "SELECT * FROM caregiver_patients WHERE patient_id = $1 AND caregiver_id = $2",
      [patient_id, caregiver_id]
    );

    if (existingConnection.rows.length > 0) {
      res.json({"response": "Already connected to this caregiver"});
      return;
    }

    // Create request
    await db.query(
      "INSERT INTO caregiver_requests (patient_id, caregiver_id, patient_email, caregiver_email, status, request_type) VALUES ($1, $2, $3, $4, 'pending', 'patient_to_caregiver')",
      [patient_id, caregiver_id, patient_email, caregiver_email]
    );

    res.json({"response": "success"});
  } catch (error) {
    console.log("Error requesting caregiver:", error);
    res.json({"response": "Error sending request"});
  }
});

// Get pending requests sent by patient
app.get("/pending-requests/patient/:patient_id", async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const result = await db.query(`
      SELECT cr.id, cr.caregiver_email, cr.created_at, c.first_name, c.last_name
      FROM caregiver_requests cr
      LEFT JOIN caregivers c ON cr.caregiver_id = c.caregiver_id
      WHERE cr.patient_id = $1 AND cr.status = 'pending' AND cr.request_type = 'patient_to_caregiver'
      ORDER BY cr.created_at DESC
    `, [patient_id]);

    res.json({"response": "success", "requests": result.rows});
  } catch (error) {
    console.log("Error fetching pending requests:", error);
    res.json({"response": "Error fetching requests"});
  }
});

// Get incoming requests to patient
app.get("/incoming-requests/patient/:patient_id", async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const result = await db.query(`
      SELECT cr.id, cr.caregiver_email, cr.created_at, c.first_name, c.last_name,
             CONCAT(c.first_name, ' ', c.last_name) as caregiver_name
      FROM caregiver_requests cr
      JOIN caregivers c ON cr.caregiver_id = c.caregiver_id
      WHERE cr.patient_id = $1 AND cr.status = 'pending' AND cr.request_type = 'caregiver_to_patient'
      ORDER BY cr.created_at DESC
    `, [patient_id]);

    res.json({"response": "success", "requests": result.rows});
  } catch (error) {
    console.log("Error fetching incoming requests:", error);
    res.json({"response": "Error fetching requests"});
  }
});

// Respond to request (accept/decline)
app.post("/respond-request", async (req, res) => {
  try {
    const { request_id, accept } = req.body;

    // Get request details
    const requestDetails = await db.query(
      "SELECT * FROM caregiver_requests WHERE id = $1 AND status = 'pending'",
      [request_id]
    );

    if (requestDetails.rows.length === 0) {
      res.json({"response": "Request not found or already processed"});
      return;
    }

    const request = requestDetails.rows[0];

    if (accept) {
      // Accept: Create caregiver-patient relationship and update request status
      await db.query("BEGIN");

      try {
        // Check if relationship already exists
        const existingConnection = await db.query(
          "SELECT * FROM caregiver_patients WHERE patient_id = $1 AND caregiver_id = $2",
          [request.patient_id, request.caregiver_id]
        );

        if (existingConnection.rows.length === 0) {
          await db.query(
            "INSERT INTO caregiver_patients (caregiver_id, patient_id) VALUES ($1, $2)",
            [request.caregiver_id, request.patient_id]
          );
        }

        await db.query(
          "UPDATE caregiver_requests SET status = 'accepted' WHERE id = $1",
          [request_id]
        );

        await db.query("COMMIT");
        res.json({"response": "success"});
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    } else {
      // Decline: Just update request status
      await db.query(
        "UPDATE caregiver_requests SET status = 'declined' WHERE id = $1",
        [request_id]
      );
      res.json({"response": "success"});
    }
  } catch (error) {
    console.log("Error responding to request:", error);
    res.json({"response": "Error processing response"});
  }
});

// Get incoming requests to caregiver
app.get("/incoming-requests/caregiver/:caregiver_id", async (req, res) => {
  try {
    const caregiver_id = req.params.caregiver_id;
    const result = await db.query(`
      SELECT cr.id, cr.patient_email, cr.created_at, p.first_name, p.last_name,
             CONCAT(p.first_name, ' ', p.last_name) as patient_name
      FROM caregiver_requests cr
      JOIN patients p ON cr.patient_id = p.patient_id
      WHERE cr.caregiver_id = $1 AND cr.status = 'pending' AND cr.request_type = 'patient_to_caregiver'
      ORDER BY cr.created_at DESC
    `, [caregiver_id]);

    res.json({"response": "success", "requests": result.rows});
  } catch (error) {
    console.log("Error fetching caregiver incoming requests:", error);
    res.json({"response": "Error fetching requests"});
  }
});

// Get pending requests sent by caregiver
app.get("/pending-requests/caregiver/:caregiver_id", async (req, res) => {
  try {
    const caregiver_id = req.params.caregiver_id;
    const result = await db.query(`
      SELECT cr.id, cr.patient_email, cr.created_at, p.first_name, p.last_name
      FROM caregiver_requests cr
      LEFT JOIN patients p ON cr.patient_id = p.patient_id
      WHERE cr.caregiver_id = $1 AND cr.status = 'pending' AND cr.request_type = 'caregiver_to_patient'
      ORDER BY cr.created_at DESC
    `, [caregiver_id]);

    res.json({"response": "success", "requests": result.rows});
  } catch (error) {
    console.log("Error fetching caregiver pending requests:", error);
    res.json({"response": "Error fetching requests"});
  }
});

app.post("/post-prescription", async (req, res) => {

});

app.listen(3000, '0.0.0.0', () => {
  console.log("Listening on port 3000");
})