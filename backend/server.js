require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

// Use CORS middleware
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/popular", async (req, res) => {
  const authOptions = {
    method: "post",
    url: "https://www.reddit.com/api/v1/access_token",
    data: `grant_type=password&username=${process.env.REDDIT_USER}&password=${process.env.REDDIT_PASS}`,
    headers: {
      "User-Agent": "ChangeMeClient/0.1 by YourUsername",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: process.env.CLIENT_ID,
      password: process.env.CLIENT_SECRET,
    },
  };

  try {
    console.log("Authenticating with Reddit...");
    const authResponse = await axios(authOptions);
    const accessToken = authResponse.data.access_token;
    console.log("Successfully authenticated.");

    console.log("Fetching popular posts...");
    const response = await axios.get("https://oauth.reddit.com/r/popular", {
      headers: {
        Authorization: `bearer ${accessToken}`,
        "User-Agent": "ChangeMeClient/0.1 by YourUsername",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error accessing Reddit API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      res.status(500).json({
        message: "Error accessing Reddit API",
        error: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Error accessing Reddit API",
        error: error.message,
      });
    }
  }
});

// Add NYTimes API endpoint
app.get("/api/nyt", async (req, res) => {
  try {
    console.log("Fetching NYTimes stories...");
    const response = await axios.get(
      `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${process.env.NYTIMES_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error accessing NYTimes API:", error.message);
    res.status(500).json({
      message: "Error accessing NYTimes API",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
