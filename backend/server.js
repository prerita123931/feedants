const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");
require("dotenv").config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Enable CORS
app.use(cors());

// Read JSON request body
app.use(express.json());

const PORT = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectDB() {
  await client.connect();

  db = client.db("feedants");
  

  // Prevent duplicate registration by the same user
  await db.collection("registrations").createIndex(
    {
      competitionId: 1,
      userId: 1,
    },
    {
      unique: true,
    }
  );

  // Prevent duplicate accounts with same email
  await db.collection("users").createIndex(
    {
      email: 1,
    },
    {
      unique: true,
    }
  );

  // Add / update detailed competition information
  await db.collection("competitions").updateOne(
    {
      name: "Creative Content Challenge",
    },
    {
      $set: {
        name: "Feedants Classical Dance",
        category: "Dance",
        type: "Multi-Win",
        certificate: true,

        prizePool: 1500,
        entryFee: 99,

        judgeName: "Manju Dubey",
        judgeTitle: "Professional Kathak Dancer",
        judgeExperience: "12+ Years of Experience",

        registrationDeadline: "2026-09-25T23:59:59",

        judgingParameters: [
          "Creativity",
          "Performance",
          "Presentation",
          "Technique",
          "Overall Impact",
        ],

        rewards: [
          {
            position: "1st Winner",
            amount: 550,
          },
          {
            position: "2nd Winner",
            amount: 300,
          },
          {
            position: "3rd Winner",
            amount: 240,
          },
          {
            position: "4th Winner",
            amount: 200,
          },
          {
            position: "5th Winner",
            amount: 130,
          },
          {
            position: "6th Winner",
            amount: 80,
          },
        ],

        previousWinners: [
          {
            name: "Riya Shah",
            position: "1st Winner",
            initials: "RS",
          },
          {
            name: "Aarav Mehta",
            position: "1st Winner",
            initials: "AM",
          },
          {
            name: "Neha Verma",
            position: "2nd Winner",
            initials: "NV",
          },
          {
            name: "Ishita Chopra",
            position: "3rd Winner",
            initials: "IC",
          },
        ],

        aboutCompetition:
          "Participate in the competition and showcase your creativity. Express your talent through your performance and get a chance to win exciting rewards.",

        rules: [
          "Submit original work.",
          "Follow the competition guidelines.",
          "Only valid registered participants can submit.",
          "Entries must be submitted before the deadline.",
        ],

        submissionStartTime: "2026-09-25T04:00:00",
        submissionEndTime: "2026-09-30T23:55:00",

        resultDate: "2026-09-30T23:50:00",

        refundPolicy:
          "Entry fee refund is subject to the competition policy.",

        paymentProvider: "Razorpay",

        referralReward: 10,
      },
    }
  );

  console.log("Competition details updated");

  console.log("MongoDB connected successfully");
}

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Feedants Backend is running",
  });
});

// Get competition
app.get("/api/competition", async (req, res) => {
  try {
    const competition = await db
      .collection("competitions")
      .findOne({
          name: "Feedants Classical Dance",
       });
    if (!competition) {
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    res.json(competition);
  } catch (error) {
    console.error(
      "Competition fetch error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch competition",
    });
  }
});

// Get user's registrations
app.get("/api/registrations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const registrations = await db
      .collection("registrations")
      .aggregate([
        {
          $match: {
            userId: userId,
          },
        },
        {
          $lookup: {
            from: "competitions",
            localField: "competitionId",
            foreignField: "_id",
            as: "competition",
          },
        },
        {
          $unwind: "$competition",
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            registeredAt: 1,
            competitionId: 1,

            competition: {
              name: "$competition.name",
              description: "$competition.description",
              startDate: "$competition.startDate",
              endDate: "$competition.endDate",
              totalSpots: "$competition.totalSpots",
              availableSpots: "$competition.availableSpots",
              status: "$competition.status",
              category: "$competition.category",
              type: "$competition.type",
              prizePool: "$competition.prizePool",
              entryFee: "$competition.entryFee",
              judgeName: "$competition.judgeName",
              judgeTitle: "$competition.judgeTitle",
              judgeExperience:
                "$competition.judgeExperience",
            },
          },
        },
      ])
      .toArray();

    res.json(registrations);
  } catch (error) {
    console.error(
      "Registrations fetch error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to fetch registrations",
    });
  }
});

// ===============================
// SIGNUP
// ===============================

app.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const existingUser = await db
      .collection("users")
      .findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const result = await db
      .collection("users")
      .insertOne({
        name: cleanName,
        email: cleanEmail,
        passwordHash: passwordHash,
        createdAt: new Date(),
      });

    res.status(201).json({
      message:
        "Account created successfully",

      user: {
        userId:
          result.insertedId.toString(),
        name: cleanName,
        email: cleanEmail,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error(
      "Signup error:",
      error.message
    );

    res.status(500).json({
      message: "Signup failed",
    });
  }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user = await db
      .collection("users")
      .findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (
      passwordHash !== user.passwordHash
    ) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",

      user: {
        userId:
          user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ===============================
// REGISTER USER FOR COMPETITION
// ===============================

app.post(
  "/api/competition/:id/register",
  async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid competition ID",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const competitionId =
      new ObjectId(id);

    const session =
      client.startSession();

    try {
      const competition = await db
        .collection("competitions")
        .findOne({
          _id: competitionId,
        });

      if (!competition) {
        return res.status(404).json({
          message: "Competition not found",
        });
      }

      const existingRegistration =
        await db
          .collection("registrations")
          .findOne({
            competitionId,
            userId,
          });

      if (existingRegistration) {
        return res.status(409).json({
          message:
            "User is already registered",
        });
      }

      await session.withTransaction(
        async () => {
          const updateResult =
            await db
              .collection("competitions")
              .updateOne(
                {
                  _id: competitionId,
                  availableSpots: {
                    $gt: 0,
                  },
                },
                {
                  $inc: {
                    availableSpots: -1,
                  },
                },
                {
                  session,
                }
              );

          if (
            updateResult.modifiedCount !== 1
          ) {
            throw new Error(
              "COMPETITION_FULL"
            );
          }

          await db
            .collection("registrations")
            .insertOne(
              {
                competitionId,
                userId,
                registeredAt:
                  new Date(),
              },
              {
                session,
              }
            );
        }
      );

      const updatedCompetition =
        await db
          .collection("competitions")
          .findOne({
            _id: competitionId,
          });

      res.status(201).json({
        message:
          "Successfully registered",
        competition:
          updatedCompetition,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "User is already registered",
        });
      }

      if (
        error.message ===
        "COMPETITION_FULL"
      ) {
        return res.status(409).json({
          message:
            "Registration is full",
        });
      }

      console.error(
        "Registration error:",
        error.message
      );

      res.status(500).json({
        message: "Registration failed",
      });
    } finally {
      await session.endSession();
    }
  }
);

// ===============================
// START SERVER
// ===============================

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        "Feedants backend running on http://localhost:" +
          PORT
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });