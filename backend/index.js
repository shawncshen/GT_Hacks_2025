import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import pg from "pg";
import "dotenv/config";

const app = express();
const salt_rounds = 10;

const pg_password = String(process.env.PG_PASSWORD || "");

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

    const checkPatientUser = await db.query("select * from patients where email = $1", [email]);
    const checkCareUser = await db.query("select * from caregivers where email = $1", [email]);
    if(checkCareUser.rows.length > 0){
      bcrypt.compare(password, checkCareUser.rows[0].password, (err, result) => {
        if (err){
          console.log(err);
        } else {
          if (result){
            res.json({"response": "success", "userID": checkCareUser.rows[0].caregiver_id, "role": "caregiver"});
          } else {
            res.json({"response": "Incorrect password"});
          }
        }
      })
    } else if (checkPatientUser.rows.length > 0){
      bcrypt.compare(password, checkPatientUser.rows[0].password, (err, result) => {
        if (err){
          console.log(err);
        } else {
          if (result){
            res.json({"response": "success", "userID": checkPatientUser.rows[0].patient_id, "role": "patient"});
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
    const result = await db.query("SELECT caregiver_id, email, first_name, last_name FROM caregivers ORDER BY first_name, last_name");
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
      SELECT c.caregiver_id, c.email, c.first_name, c.last_name
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

// Request caregiver by adding to notification table (patient requesting caregiver)
app.post("/request-caregiver", async (req, res) => {
  try {
    const { patient_id, caregiver_email } = req.body;

    // Check if caregiver exists
    const caregiverCheck = await db.query("SELECT caregiver_id, first_name, last_name FROM caregivers WHERE email = $1", [caregiver_email]);

    if (caregiverCheck.rows.length === 0) {
      res.json({"response": "Caregiver not found with that email"});
      return;
    }

    const caregiver_id = caregiverCheck.rows[0].caregiver_id;

    // Check if request already exists
    // const existingRequest = await db.query(
    //   "SELECT * FROM caregiver_requests WHERE patient_id = $1 AND caregiver_id = $2 AND status = 'pending'",
    //   [patient_id, caregiver_id]
    // );

    const putNotification = await db.query("insert into notifications (sender_id, sender_type, receiver_id, receiver_type, message) values ($1, $2, $3, $4, $5)", [
      patient_id, "patient", caregiver_id, "caregiver", `${patient_id} sends request to ${caregiver_id}`
    ]);


    // Check if already connected
    const existingConnection = await db.query(
      "SELECT * FROM caregiver_patients WHERE patient_id = $1 AND caregiver_id = $2",
      [patient_id, caregiver_id]
    );

    if (existingConnection.rows.length > 0) {
      res.json({"response": "Already connected to this caregiver"});
      return;
    }

    // Check if request already exists
    const existingRequest = await db.query(
      "SELECT * FROM caregiver_requests WHERE patient_id = $1 AND caregiver_id = $2 AND status = 'pending'",
      [patient_id, caregiver_id]
    );

    if (existingRequest.rows.length > 0) {
      res.json({"response": "Request already sent to this caregiver"});
      return;
    }

    // Get patient email for the request
    const patientData = await db.query("SELECT email FROM patients WHERE patient_id = $1", [patient_id]);
    const patient_email = patientData.rows[0]?.email;

    // Request successfully created in notifications table above

    res.json({"response": "success"});
  } catch (error) {
    console.log("Error requesting caregiver:", error);
    res.json({"response": "Error sending request"});
  }
});

//In dashboard, when user clicks on their notification, pull their notifications from notification table
app.post("/get-notification", async(req, res) => {
  try {
    const user_id = req.body.user_id;
    const result = await db.query("select message, sender_id, sender_type from notifications where receiver_id = $1", [user_id]);

    if (result.rows.length > 0){
      const notifications = result.rows.map(row => ({
        "sender_id": row.sender_id,
        "sender_type": row.sender_type,
        "message": row.message
      }));
      res.json({"response": "success", "notifications": notifications});
    } else {
      res.json({"response": "success", "notifications": []});
    }
  } catch (error) {
    console.log("Error fetching notifications:", error);
    res.json({"response": "Error fetching notifications"});
  }
});

app.post("/add-caregiver", async (req, res) => {
  const patient_id = req.body.patient_id;
  const caregiver_id = req.body.caregiver_id;

  try {
    const result = await db.query("insert into caregiver_patients (caregiver_id, patient_id) values ($1, $2)", [caregiver_id, patient_id]);
    res.json({"response": "success"});
  } catch (error){
    res.json({"response": error});
  }

});

// Delete notification after caregiver responds to request
app.post("/delete-notification", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;
    await db.query("DELETE FROM notifications WHERE sender_id = $1 AND receiver_id = $2 AND sender_type = 'patient' AND receiver_type = 'caregiver'", [sender_id, receiver_id]);
    res.json({"response": "success"});
  } catch (error) {
    console.log("Error deleting notification:", error);
    res.json({"response": "Error deleting notification"});
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
  const {patient_id, prescriptions} = req.body;

  try {
    console.log('Adding prescriptions for patient:', patient_id);
    console.log('Prescriptions data:', prescriptions);

    for (const p of prescriptions){
      await db.query("insert into prescriptions (prescription_name, prescription_amount, prescription_frequency, patient_id) values ($1, $2, $3, $4)", [
        p.name, p.amount, p.frequency, patient_id
      ]);
    }
    res.json({"response": "success"});
  } catch (error){
    console.log("Error adding prescriptions:", error);
    res.json({"response": "Error adding prescriptions"});
  }
});

// Get prescriptions for a specific patient
app.get("/patient-prescriptions/:patient_id", async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const result = await db.query("SELECT prescription_name, prescription_amount, prescription_frequency FROM prescriptions WHERE patient_id = $1 ORDER BY prescription_name", [patient_id]);

    res.json({"response": "success", "prescriptions": result.rows});
  } catch (error) {
    console.log("Error fetching patient prescriptions:", error);
    res.json({"response": "Error fetching prescriptions"});
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log("Listening on port 3001");
})