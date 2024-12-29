const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("frontend")); // Serve frontend files

// Sample "database"
const websites = [
  { url: "https://www.youtube.com", title: "YouTube", category: ".com", content: "Videos, tutorials, music", ranking_score: 10.0 },
  { url: "https://www.wikipedia.org", title: "Wikipedia", category: ".org", content: "Encyclopedia, articles, knowledge", ranking_score: 9.5 },
  { url: "https://www.oed.com", title: "Oxford English Dictionary", category: ".com", content: "Definitions, word origins", ranking_score: 9.2 },
  { url: "https://bombuj.tv", title: "Bombuj", category: ".tv", content: "Streaming TV and movies", ranking_score: 8.7 },
  { url: "https://proton.me/mail", title: "Proton Mail", category: ".me", content: "Secure email service", ranking_score: 9.0 },
  { url: "https://proton.me/calendar", title: "Proton Calendar", category: ".me", content: "Private scheduling and events", ranking_score: 8.8 },
  { url: "https://github.com", title: "GitHub", category: ".com", content: "Code hosting and collaboration", ranking_score: 9.5 }
];

// Specialized sites
const specializedSites = ["YouTube", "Wikipedia", "Oxford English Dictionary"];

// Search API
app.get("/search", (req, res) => {
  const query = req.query.query?.toLowerCase().trim();

  if (!query) {
    return res.json([]);
  }

  // Specialized content handling
  const specializedResult = websites.find(
    (site) => specializedSites.includes(site.title) && site.title.toLowerCase().includes(query)
  );
  if (specializedResult) {
    return res.json([{ specialized: true, site: specializedResult }]);
  }

  // Regular results
  const results = websites
    .filter(
      (site) =>
        site.title.toLowerCase().includes(query) || site.content.toLowerCase().includes(query)
    )
    .sort((a, b) => b.ranking_score - a.ranking_score); // Sort by ranking score

  res.json(results);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// JavaScript Document